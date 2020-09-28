import React, { useRef, useState } from "react";
import propTypes from "prop-types";
import cn from "classnames";
import { Axis } from "../slide";
import useDidUpdate from "./useDidUpdate";
import useGlobalHandlerAttach from "./useGlobalHandlerAttach";
import styles from "./styles.module.less";

const Duration = 300;
const MaxDistance = 35;
const ScrollMinDistance = 45; // 滚动加载 距离底部  触发距离

/* 手指触摸的状态 */
const TouchStatus = {
  Started: "started",
  Moving: "Moving",
  End: "End",
};

/* 触发类型 */
const FetchType = {
  Scroll: "Scroll",
  Refresh: "Refresh",
};

/* 下拉刷新状态 */
const RefreshStatus = {
  Pulling: "Pulling",
  IsMax: "IsMax", // 已到达触发点
  Fetching: "Fetching",
  Done: "Done",
};

/* 上滑无限加载 */
const ScrollStatus = {
  AllLoaded: "AllLoaded",
  Fetching: "Fetching",
  Done: "Done",
};

/**
 *
 * @prop {function} onFetch  开始请求
 * @prop {object} style
 * @prop {boolean} disableRefresh 禁用下拉刷新
 * @prop {boolean} disableScroll  禁用滚动加载
 * @prop {boolean} stopPropagation 阻止滚动事件冒泡
 * @prop {el} scrollElement 滚动的元素
 *
 * */

const Fetch = (props) => {
  const {
    children,
    style,
    className,
    disableRefresh,
    disableScroll,
    stopScrollPropagation,
    onFetch,
  } = props;
  const wrapElRef = useRef(null);
  // track 元素滑动距离
  const [distance, setDistance] = useState(0);
  // track 元素滑动是否需要过渡效果
  const [needTransition, setNeedTransition] = useState(false);
  // 下拉加载的状态
  const [pullRefreshStatus, setPullRefreshStatus] = useState(
    RefreshStatus.Done
  );
  // 滚动加载的状态
  const [scrollFetchStatus, setScrollFetchStatus] = useState(ScrollStatus.Done);
  // 手指触摸状态
  const touchStatusRef = useRef(TouchStatus.End);
  // 下拉刷新归位时，禁用下拉操作
  const isRefreshDisabledRef = useRef(false);

  // 加载状态 ?  下拉刷新 | 无限滚动
  const fetchTypeRef = useRef(null);
  const isFetchingRef = useRef(false);
  const promiseRejectRef = useRef(null);
  const fetch = (fetchType) => {
    // 如果正在请求, 之后的触发都无效, 直到请求完成
    // 但如果两次的请求类型不同, 则继续
    if (isFetchingRef.current && fetchTypeRef.current === fetchType) {
      return;
    }
    fetchTypeRef.current = fetchType;
    isFetchingRef.current = true;

    // reject上次的Promise
    if (promiseRejectRef.current) {
      promiseRejectRef.current();
      promiseRejectRef.current = null;
    }

    new Promise((resolve, reject) => {
      promiseRejectRef.current = reject;
      onFetch(resolve, fetchType);
    }).then((hasAllLoaded) => {
      try {
        // 重置状态
        isFetchingRef.current = false;
        setDistance(0);
        setPullRefreshStatus(RefreshStatus.Done);
        setNeedTransition(true);
        setScrollFetchStatus(
          hasAllLoaded ? ScrollStatus.AllLoaded : ScrollStatus.Done
        );
      } catch (error) {
        console.log("fetch Error:");
        console.log(error);
      }
    });
  };

  const touchStartHandler = () => {
    // 如果此时加载完成, 元素正在归位, 禁止滑动
    if (isRefreshDisabledRef.current || props.disableRefresh) {
      return;
    }

    // 滚动距离为0, 说明在列表最顶部，此时允许触发下拉刷新
    const isTop = wrapElRef.current.scrollTop === 0;
    touchStatusRef.current = isTop ? TouchStatus.Started : TouchStatus.End;
  };

  const touchMoveHandler = (obj, e) => {
    const touch = obj.touches[0];

    if (
      /* 左右滑动 */
      touch.axis === Axis.X ||
      /* 只有状态为 TouchStatus.Started 或 TouchStatus.Moving 才允许触发 */
      touchStatusRef.current === TouchStatus.End ||
      isRefreshDisabledRef.current
    ) {
      return;
    }

    //  在最顶部, 但是不是下拉操作, 流程无效
    if (touchStatusRef.current === TouchStatus.Started && touch.direction < 0) {
      touchStatusRef.current = TouchStatus.End;
      return;
    }

    touchStatusRef.current = TouchStatus.Moving;

    // 阻止默认事件，在ios上整个网页会被拉下来
    e.preventDefault();

    const isFetching = pullRefreshStatus === RefreshStatus.Fetching;

    // 5. 设置下拉 距离
    // 越大，粘滞感越强
    let diff = (touch.direction * touch.diffY < 0 ? 0 : touch.diffY) / 4;
    if (isFetching) {
      diff += MaxDistance;
    }

    setPullRefreshStatus(
      /* eslint-disable-next-line no-nested-ternary */
      isFetching
        ? RefreshStatus.Fetching
        : diff < MaxDistance
        ? RefreshStatus.Pulling
        : RefreshStatus.IsMax
    );
    setDistance(diff);
    setNeedTransition(false);
  };

  const touchEndHandler = () => {
    if (
      touchStatusRef.current !== TouchStatus.Moving ||
      isRefreshDisabledRef.current
    ) {
      return;
    }

    touchStatusRef.current = TouchStatus.End;

    const isMax = pullRefreshStatus === RefreshStatus.IsMax;
    const isFetching = pullRefreshStatus === RefreshStatus.Fetching;

    setNeedTransition(true);
    setDistance(isMax || isFetching ? MaxDistance : 0);
    setPullRefreshStatus(
      isMax || isFetching ? RefreshStatus.Fetching : RefreshStatus.Done
    );

    // 当拉到最大位置, 且此时没有在请求数据时才执行
    if (!isMax) {
      return;
    }
    fetch(FetchType.Refresh);
  };

  useDidUpdate(() => {
    if (pullRefreshStatus === RefreshStatus.Done) {
      isRefreshDisabledRef.current = true;
      setTimeout(() => {
        isRefreshDisabledRef.current = false;
        touchStatusRef.current = TouchStatus.End;
      }, Duration);
    }
  }, [pullRefreshStatus]);

  useGlobalHandlerAttach(
    wrapElRef,
    touchStartHandler,
    touchMoveHandler,
    touchEndHandler,
    disableRefresh
  );

  const scrollHandler = (e) => {
    // 防止嵌套Fetch 问题
    if (stopScrollPropagation) {
      e.stopPropagation();
    }
    const el = e.target;
    const { scrollTop } = el;
    //
    // // 产生滚动后给个阴影提示
    // const needShadow = scrollTop !== 0
    // if (needShadow !== this.state.needShadow) {
    //   this.setState({needShadow: needShadow})
    // }

    if (
      /* 在顶部 不触发 */
      scrollTop <= 0 ||
      /* 禁用 */
      disableScroll ||
      /* 没滚到位置， 不触发 */
      el.scrollHeight - (scrollTop + el.clientHeight) > ScrollMinDistance ||
      /* 数据全部加载完了 或  正在加载的时候  不再多次触发 */
      scrollFetchStatus === ScrollStatus.AllLoaded ||
      scrollFetchStatus === ScrollStatus.Fetching
    ) {
      return;
    }

    setScrollFetchStatus(ScrollStatus.Fetching);

    fetch(FetchType.Scroll);
  };

  return (
    <div className={cn(styles.fetch, className)}>
      <div
        ref={wrapElRef}
        style={style}
        onScroll={scrollHandler}
        className={styles.fetchContainer}
      >
        {/* 下拉加载 */}
        <div
          className={cn(styles.tipWrap, needTransition && styles.animation)}
          style={{ transform: `translate3d(0,${distance}px,0)` }}
        >
          <div className={styles.tip}>
            {(() => {
              if (pullRefreshStatus === RefreshStatus.Fetching) {
                return <div>正在加载...</div>;
              }
              return pullRefreshStatus === RefreshStatus.IsMax
                ? "松手刷新"
                : "下拉刷新";
            })()}
          </div>
        </div>
        {/* 内容 */}
        <div
          className={cn(needTransition && styles.animation)}
          style={{ transform: `translate3d(0,${distance}px,0)` }}
        >
          {children}

          {/* 上滑无限加载 */}
          {scrollFetchStatus !== ScrollStatus.Done && (
            <div className={cn(styles.tip, styles.bottomTip)}>
              {(() => {
                if (scrollFetchStatus === ScrollStatus.Fetching) {
                  return <span>正在加载...</span>;
                }
                return scrollFetchStatus === ScrollStatus.AllLoaded
                  ? "已经没有了"
                  : null;
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Fetch.propTypes = {
  disableRefresh: propTypes.bool,
  disableScroll: propTypes.bool,
  stopScrollPropagation: propTypes.bool,
  children: propTypes.element.isRequired,
  className: propTypes.string,
  style: propTypes.object,
  onFetch: propTypes.func,
};
Fetch.defaultProps = {
  disableRefresh: false,
  disableScroll: false,
  stopScrollPropagation: true,
  className: undefined,
  style: null,
  onFetch: () => undefined,
};

Fetch.isScroll = (type) => type === FetchType.Scroll;
Fetch.isRefresh = (type) => type === FetchType.Refresh;

export default React.memo(Fetch);

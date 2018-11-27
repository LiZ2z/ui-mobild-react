import React, {Component} from 'react'

class PictureUpload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      src: null,
      images: []
    }

    this.onFileChange = this.onFileChange.bind(this)
  }

  onFileChange(e) {
    const file = e.target.files[0]

    const fileReader = new FileReader()


    fileReader.onload = res => {
      console.log(res)
      this.setState({
        src: res.target.result
      })
    }

    fileReader.readAsDataURL(file)


  }

  render() {
    const state = this.state
    return (
      <div className={'u-upload__container'}>
        {
          state.images.map(img => (
            <span className={'u-img-preview'}>
                <img src={img.src} alt={img.name}/>
              </span>
          ))
        }
        <label className={'u-file-input'}>
          <input type="file" accept={'image/*'}
                 className={'u-file-input__exact'}
                 onChange={this.onFileChange}
          />
        </label>
        <img src={state.src}/>
      </div>
    )
  }
}

export default PictureUpload
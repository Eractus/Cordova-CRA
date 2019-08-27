import React, { Component } from "react";
import Camera, { FACING_MODES, IMAGE_TYPES } from "react-html5-camera-photo";
import "react-html5-camera-photo/build/css/index.css";
import axios from "axios";

class TakePhoto extends Component {
  onTakePhoto = async dataUri => {
    const config = {
      sizeFactor: 1,
      imgCompression: 0.5
    };

    var data = {
      requests: [
        {
          image: {
            content: dataUri.slice(23)
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 5
            }
          ]
        }
      ]
    };

    await axios({
      method: "post",
      url:
        "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDbXhEc-ohKbIv4J8J8drPfAnNZ1Q8cEOk",
      data
    })
      .then(r => {
        let array = r.data.responses[0].textAnnotations;
        for (let x = 1; x < array.length; x++) {
          let data = array[x].description;

          if (data.match(/\d/g) && data.length > 7) {
            return this.props.cameraOffAndSetInput(array[x].description);
          } else if (!data.match(/[A-z]/i) && data.length >= 5) {
            return this.props.cameraOffAndSetInput(array[x].description);
          }
        }
      })

      .catch(error => {
        window.confirm(error);
      });
  };

  render() {
    return (
      <div className="start-job-container">
        <Camera
          onTakePhoto={dataUri => {
            this.onTakePhoto(dataUri);
          }}
          idealFacingMode={FACING_MODES.ENVIRONMENT}
          idealResolution={{ width: 640, height: 480 }}
          imageType={IMAGE_TYPES.JPG}
          imageCompression={0.97}
          isMaxResolution={false}
          isImageMirror={false}
          isSilentMode={true}
          isDisplayStartCameraError={true}
          isFullscreen={false}
          sizeFactor={1}
        />
      </div>
    );
  }
}

export default TakePhoto;

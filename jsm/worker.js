import { Gaussian } from './scaleField.js'

onmessage = function (e) {
    let gaussian1 = new Gaussian(e.data[0])
    gaussian1.diff(e.data[1], (volume, progress) => {
        this.postMessage([volume, progress, e.data[1]])
    })
}
import * as THREE from "../threejs/build/three.module.js";
import { VolumeRenderShader1 } from '../threejs/examples/jsm/shaders/VolumeShader.js'
import { OrbitControls } from '../threejs/examples/jsm/controls/OrbitControls.js'

class threejsViewer {
    constructor(domElement) {

        let width = domElement.clientWidth;
        let height = domElement.clientHeight;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0xE6E6FA, 1.0)
        domElement.appendChild(this.renderer.domElement);

        // Scene
        this.scene = new THREE.Scene();

        // Camera
        let unit = 1
        let ratio = width / height * unit

        this.camera = new THREE.OrthographicCamera(-ratio, ratio, unit, - unit, 0.01, 100);
        this.camera.position.set(8, 4, 8)
        this.scene.add(this.camera)

        // Light
        let directionalLight = new THREE.DirectionalLight(0xffffff, 1)
        directionalLight.position.set(2, 1, 2)
        
        this.scene.add(directionalLight)
        this.scene.add(new THREE.HemisphereLight(0x443333, 0x111122))

        // Controller
        let controller = new OrbitControls(this.camera, this.renderer.domElement)
        controller.target.set(0, 0.5, 0)
        controller.update()

        controller.addEventListener('change', () => {
            this.renderScene()
        })
        
        //Axis Landmark
        const axesHelper = new THREE.AxesHelper(100)
        this.scene.add(axesHelper)

        // Ground
        const plane = new THREE.Mesh(
            new THREE.CircleGeometry(2, 30),
            new THREE.MeshPhongMaterial({ color: 0xbbddff, side: THREE.DoubleSide, opacity:0.4, transparent: true })
        );
        plane.rotation.x = - Math.PI / 2;
        this.scene.add(plane);

        /*
        const sphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry(10, 20, 10),
            new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.BackSide })
        );
        sphere.rotation.x = - Math.PI / 2;
        this.scene.add(sphere);
        */

        // 受制於陣列大小，Math.max/min無法滿足最大/最小值搜尋的需求，需要手動實作下列函式
        let getMinMax = function (dataBuffer) {
            if (dataBuffer.length <= 0) {
                return { min: 0, max: 0 }
            }
            else if (dataBuffer.length == 1) {
                return { min: dataBuffer[0], max: dataBuffer[0] }
            }

            let min = dataBuffer[0]
            let max = dataBuffer[0]
            for (let i = 0; i < dataBuffer.length; i++) {
                if (dataBuffer[i] > max) {
                    max = dataBuffer[i]
                }
                if (dataBuffer[i] < min) {
                    min = dataBuffer[i]
                }
            }

            return { min: min, max: max }
        }

        this.renderScene = function() {

            //render scene
            this.renderer.render(this.scene, this.camera);
        }

        /**
         * 由點座標生成模型
         * @param {any} dims: 資料的維度
         * @param {any} vertices: 點座標陣列，以unsigned byte array儲存
         * @param {any} vertexCount: 陣列排序的單位量，通常以3筆資料生成一個節點
         */
        this.loadModelfromVertices = function (dims, vertices, meshCount) {
            let scaleSize = 1 / getMinMax(dims).min

            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, meshCount));
            geometry.translate(-dims[0] / 2, -dims[1] / 2, -dims[2] / 2)
            geometry.computeVertexNormals()

            let mesh = this.scene.getObjectByName('model')

            if (mesh != null && mesh instanceof THREE.Object3D) {
                mesh.geometry = geometry
            }
            else {
                const material = new THREE.MeshStandardMaterial({ color: 0x0055ff, flatShading: true, side: THREE.DoubleSide });
                mesh = new THREE.Mesh(geometry, material)
                mesh.name = 'model'
            }

            mesh.position.set(0, dims[1] * scaleSize / 2, 0)
            mesh.scale.set(scaleSize, scaleSize, scaleSize)
            
            this.scene.add(mesh)
        }

        // 移除指定名稱的物件
        this.clearModel = function () {
            let mesh = this.scene.getObjectByName('volume')
            if (mesh != null) {
                this.scene.remove(mesh)
            }
        }

        this.renderScene()
    }
}

export {
    threejsViewer
}

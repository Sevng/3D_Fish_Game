import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.122/build/three.module.js';

import {math} from './math.js';

import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.122/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js';


export const background = (() => {


  class BackgroundCrap {
    constructor(params) {
      this.params_ = params;
      this.position_ = new THREE.Vector3();
      this.quaternion_ = new THREE.Quaternion();
      this.scale_ = 1.0;
      this.mesh_ = null;

      this.LoadModel_();
    }

    LoadModel_() {
      const assets = [
          ['phormium_tenax.glb', 'phormium_t_leaf_1_1_diffuse_3.jpg', 1.3],
          ['phormium_tenax.glb', 'phormium_t_leaf_2_1_diffuse_1.jpg', 1.3],
          ['phormium_tenax.glb', 'phormium_t_leaf_2_1_diffuse_2.jpg', 1.3],
		  ['hoewa_Forsteriana.glb', 'howea_f_leaf_1_diffuse.jpg', 0.15],
          ['Rock_1.glb', 'Rock_1_Base_Color.jpg', 4],
		  ['Bucket.glb', 'M_Bucket_BaseColor.png', 0.3],
          ['Bottle.glb', 'Bottle.png', 3],
          ['Barrel.glb', 'Barrel.png', 3],
		  ['Barrel2.glb', 'Barrel2.png', 5],
		  ['Wooden_Barrel.glb', 'LightBarrelIron.png', 3]
      ];
      const [asset, textureName, scale] = assets[math.rand_int(0, assets.length - 1)];  // 나오는 배경요소들 

      const texLoader = new THREE.TextureLoader();
      const texture = texLoader.load('./resources/Ocean/GLTF/Textures/' + textureName);
      texture.encoding = THREE.sRGBEncoding;

      const loader = new GLTFLoader();
      loader.setPath('./resources/Ocean/GLTF/');
      loader.load(asset, (glb) => {
        this.mesh_ = glb.scene;
        this.params_.scene.add(this.mesh_);
 
        this.position_.x = math.rand_range(-10, 2000);
		this.position_.y = -6;                         // -5 배경요소 땅에 붙이기 
        this.position_.z = math.rand_range(-100, 100);   // (,1) 물고기라인 직전까지만 장애물 생성 
        this.scale_ = scale;

        const q = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), math.rand_range(0, 360));
        this.quaternion_.copy(q);

        this.mesh_.traverse(c => {
          let materials = c.material;
          if (!(c.material instanceof Array)) {
            materials = [c.material];
          }
  
          for (let m of materials) {
            if (m) {
              if (texture) {
                m.map = texture;
              }
              m.specular = new THREE.Color(0x000000);
            }
          }    
          c.castShadow = true;
          c.receiveShadow = true;
        });
      });
    }

    Update(timeElapsed) {
      if (!this.mesh_) {
        return;
      }

      this.position_.x -= timeElapsed * 10;
      if (this.position_.x < -100) {
        this.position_.x = math.rand_range(2000, 3000);
      }

      this.mesh_.position.copy(this.position_);
      this.mesh_.quaternion.copy(this.quaternion_);
      this.mesh_.scale.setScalar(this.scale_);
    }
  };

  class Background {
    constructor(params) {
      this.params_ = params;
      this.clouds_ = [];
      this.crap_ = [];
      
      this.SpawnCrap_();
    }


    SpawnCrap_() {
      for (let i = 0; i < 100; ++i) {
        const crap = new BackgroundCrap(this.params_);

        this.crap_.push(crap);
      }
    }

    Update(timeElapsed) {
      for (let c of this.clouds_) {
        c.Update(timeElapsed);
      }
      for (let c of this.crap_) {
        c.Update(timeElapsed);
      }
    }
  }

  window.addEventListener("keydown", function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

  return {
      Background: Background,
  };
})();
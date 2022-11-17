import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {math} from './math.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js';


export const world = (() => {

  const START_POS = 100;
  const SEPARATION_DISTANCE = 20;

  class WorldObject {
    constructor(params) {
      this.position = new THREE.Vector3();
      this.quaternion = new THREE.Quaternion();
      this.scale = 1.0;
      this.collider = new THREE.Box3();

      this.params_ = params;
      this.LoadModel_();
    }

    LoadModel_() {
      const texLoader = new THREE.TextureLoader();
      const texture = texLoader.load('./resources/Ocean/GLTF/Textures/Ground.png');
      texture.encoding = THREE.sRGBEncoding;

      const loader = new FBXLoader();
      loader.setPath('./resources/Ocean/FBX/');
      loader.load('Fish'+ math.rand_int(1, 5) + '.fbx', (fbx) => {
        fbx.scale.setScalar(0.0001);

        this.mesh = fbx;
        this.params_.scene.add(this.mesh);

        fbx.traverse(c => {
          if (c.geometry) {
            c.geometry.computeBoundingBox();
          }

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

    UpdateCollider_() {
      this.collider.setFromObject(this.mesh);
    }

    Update(timeElapsed) {
      if (!this.mesh) {
        return;
      }
      this.mesh.position.copy(this.position);
      this.mesh.quaternion.copy(this.quaternion);
      this.mesh.scale.setScalar(this.scale);
      this.UpdateCollider_();
    }
  }

  class WorldManager {
    constructor(params) {
      this.objects_ = [];
      this.unused_ = [];
      this.speed_ = 25;              // 게임 속도 
      this.params_ = params;
      this.score_ = 0.0;
      this.scoreText_ = '00000';
      this.separationDistance_ = SEPARATION_DISTANCE;
    }

     GetColliders() {
      return this.objects_;
    }

    GetColPoints(){
      return this.objPoint;
    }

    SetPoints(pts){
      this.score_ += pts;
    }

    LastObjectPosition_() {
      if (this.objects_.length == 0) {
        return SEPARATION_DISTANCE;
      }

      return this.objects_[this.objects_.length - 1].position.x;
    }

    SpawnObj_(scale, offset) {
      let obj = null;

      if (this.unused_.length > 0) {
        obj = this.unused_.pop();
        obj.mesh.visible = true;
      } else {
        obj = new WorldObject(this.params_);
      }

      obj.quaternion.setFromAxisAngle(
          new THREE.Vector3(0, 1, 0), Math.PI* -0.5); //Math.random() * Math.PI * 2.0); 장애물이 쳐다보는 방향
      obj.position.x = START_POS + offset;
      obj.position.z = math.rand_int(-12, 12);  // 물고기 여러줄 
      obj.scale = scale * 0.004;   // 장애물 크기
      this.objects_.push(obj);
    }

    SpawnCluster_() {
      var scaleIndex = math.rand_int(0, 13);
      var scales = [0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 1, 1.15, 1.25, 1.5, 1.75, 2, 2.25, 2.5];     // 랜덤 장애물 사이즈 범위 
      var scale = scales[scaleIndex];
      var numObjects = 1;
      for (let i = 0; i < numObjects; ++i) {
        const offset = i * 1 * scale;
        this.SpawnObj_(scale, offset);
      }
    }


    MaybeSpawn_() {
      const closest = this.LastObjectPosition_();
      if (Math.abs(START_POS - closest) > this.separationDistance_) {
        this.SpawnCluster_();
        this.separationDistance_ = math.rand_range(SEPARATION_DISTANCE, SEPARATION_DISTANCE * 1.5); // 장애물 사이의 거리
      }
    }

    Update(timeElapsed) {
      this.MaybeSpawn_();
      this.UpdateColliders_(timeElapsed);
      this.UpdateScore_(timeElapsed);
    }

    UpdateScore_(timeElapsed) {

      const scoreText = Math.round(this.score_).toLocaleString(
          'en-US', {minimumIntegerDigits: 5, useGrouping: false});

      if (scoreText == this.scoreText_) {
        return;
      }

      document.getElementById('score-text').innerText = scoreText;
    }

    UpdateColliders_(timeElapsed) {
      const invisible = [];
      const visible = [];

      for (let obj of this.objects_) {
        obj.position.x -= timeElapsed * this.speed_;

        if (obj.position.x < -40) {
          invisible.push(obj);
          obj.mesh.visible = false;
        } else {
          visible.push(obj);
        }

        obj.Update(timeElapsed);
      }

      this.objects_ = visible;
      this.unused_.push(...invisible);
    }
  };

  return {
      WorldManager: WorldManager,
  };
})();
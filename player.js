import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.124/build/three.module.js';

import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.124/examples/jsm/loaders/FBXLoader.js';


export const player = (() => {

  let time1;
  let time2;
  
  class Player {
	  
    constructor(params) {
      this.position_ = new THREE.Vector3(-10, 10, 0);  // 캐릭ㄱ터 시작 위치 (전진, , 오른쪽)
      this.velocity_ = 0.0;  // 속도
      this.points = 1;

      this.playerBox_ = new THREE.Box3();

      this.params_ = params;

      this.LoadModel_();
      this.InitInput_();
    }

    LoadModel_() {
      const loader = new FBXLoader();
      loader.setPath('./resources/player/FBX/');
      loader.load('Shark.fbx', (fbx) => {
        fbx.scale.setScalar(0.004);   //0.008
        fbx.quaternion.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0), Math.PI / 2);   // 캐릭터가 바라보는 방향  (정면: Math.PI / 2)

        this.mesh_ = fbx;
        this.params_.scene.add(this.mesh_);

        fbx.traverse(c => {
          let materials = c.material;
          if (!(c.material instanceof Array)) {
            materials = [c.material];
          }
  
          for (let m of materials) {
            if (m) {
              m.specular = new THREE.Color(0x000000);
              m.color.offsetHSL(0, 0, 0.25);
            }
          }    
          c.castShadow = true;
          c.receiveShadow = true;
        });

        const m = new THREE.AnimationMixer(fbx);
        this.mixer_ = m;

        for (let i = 0; i < fbx.animations.length; ++i) {
            const clip = fbx.animations[i];
            const action = this.mixer_.clipAction(clip);     // 캐릭터 헤엄치는 모션 
            action.play();
        }
      });
    }

    InitInput_() {
      this.keys_ = {
          spacebar: false,
          arrowleft : false,
          arrowright : false,
          arrowup : false,
          arrowdown : false

      };
      this.oldKeys = {...this.keys_};

      document.addEventListener('keydown', (e) => this.OnKeyDown_(e), false);
      document.addEventListener('keyup', (e) => this.OnKeyUp_(e), false);
    }

    OnKeyDown_(event) {
      switch(event.keyCode) {

        case 32:
          this.keys_.space = true;
          break;

        case 37:
          this.keys_.arrowleft = true;
          break;

        case 38:
          this.keys_.arrowup = true;
          break;

        case 39:
          this.keys_.arrowright = true;
          break;

        case 40:
          this.keys_.arrowdown = true;
          break;
        }
    }


    OnKeyUp_(event) {
      switch(event.keyCode) {

        case 32:
          this.keys_.space = false;
          break;

        case 37:
          this.keys_.arrowleft = false;
          break;

        case 38:
          this.keys_.arrowup = false;
          break;

        case 39:
          this.keys_.arrowright = false;
          break;

        case 40:
          this.keys_.arrowdown = false;
          break;
      }
    }

    CheckCollisions_() {
      const colliders = this.params_.world.GetColliders();

      this.playerBox_.setFromObject(this.mesh_);
	  let midTime;

      for (let c of colliders) {
        const cur = c.collider;
        let pt = (c.scale)*250;

        midTime = time2 - time1;

        if (cur.intersectsBox(this.playerBox_)) {
          time2 = new Date().getTime();


          if (midTime < 850){
            continue;
          }
          else{

            console.log("Time : " + pt + " - " + time2 + " - " + time1 + " = " + midTime);
            console.log("Point : C - " + pt + " / you - " + this.points);
            console.log("("+this.position_.x+", "+this.position_.y+", "+this.position_.z+")");

          if(this.points === undefined){
            console.log("error");
            continue;
          }

          else if (this.points < pt){
            console.log("LOSE : You are " + this.points + " and you ate " + pt + ".");
            this.gameOver = true;
          }

          else if (this.points >= pt) {
            console.log("WIN : You are " + this.points + " and you ate " + pt/10 + ".");
            pt = ((Math.round(10000.0*pt))/10000.0);
            this.points = this.points + (pt/10);
            this.points = ((Math.round(10000.0*this.points))/10000.0);
            this.mesh_.scale.setScalar(this.points * 0.005);
            this.params_.world.SetPoints(pt*10);
            console.log("NOW YOU ARE" + this.points + ".") 
          }
        }

          cur.visible = false;
          time1 = new Date().getTime();
        }
      }
    }

    getScore(timeElapsed) {

      if(this.points === undefined){
        return 0;
      }
      else{
        return this.points;
      }
    }

    Update(timeElapsed) {
      if (this.keys_.space && this.position_.y == 0.0) {
        this.velocity_ = 30;
      }

      const acceleration = -60 * timeElapsed;

      this.position_.y += timeElapsed * (
          this.velocity_ + acceleration * 0.5);
      this.position_.y = Math.max(this.position_.y, 0.0);

      this.velocity_ += acceleration;
      this.velocity_ = Math.max(this.velocity_, -100);

      if (this.keys_.arrowup) {
        this.position_.x += 0.4;
      }

      if (this.keys_.arrowdown) {
        this.position_.x -= 0.4;
      }

      if (this.keys_.arrowleft) {
        this.position_.z -= 0.4;
      }

      if (this.keys_.arrowright) {
        this.position_.z += 0.4;
      }

      if (this.mesh_) {
        this.mixer_.update(timeElapsed);
        this.mesh_.position.copy(this.position_);
        this.CheckCollisions_();
      }
    }
  };

  return {
      Player: Player,
  };
})();
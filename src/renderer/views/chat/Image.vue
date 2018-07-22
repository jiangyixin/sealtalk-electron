<template>
  <div class="choice-block">
    <input id="file" @change="uploadToQiniu" class="choice-image" type="file" accept="image/*">
    <label class="file-label" for="file"><icon name="image"></icon></label>
    <div v-if="percentage > 0 && percentage < 100" class="progress-row">
      <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage"></el-progress>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { getQiniuToken } from '../../api/qiniu'
  import axios from 'axios'
  const lrz = require('lrz')

  export default {
    name: 'RcImage',
    props: {

    },
    computed: {
      ...mapGetters(['userId'])
    },
    data () {
      return {
        percentage: 0,
        image: {
          key: '',
          content: '',
          imageUri: ''
        }
      }
    },
    created () {

    },
    methods: {
      uploadToQiniu (e) {
        let file = e.target.files[0]
        if (file) {
          let param = new FormData()
          param.append('file', file, file.name)
          getQiniuToken().then(data => {
            param.append('token', data.token)
            // param.append('key', `sealtalk/${this.userId}/${Date.now()}-${file.name}`)
            let opt = {
              width: 200,
              height: 200
            }
            lrz(file, opt).then(ret => {
              let config = {
                headers:{'Content-Type':'multipart/form-data'},
                onUploadProgress: progressEvent => {
                  this.percentage = (progressEvent.loaded / progressEvent.total * 100 | 0)
                  this.$emit('on-progress', this.percentage)
                }
              }
              axios.post('https://upload.qiniu.com/', param, config).then(resp => {
                this.image.key = resp.data.key
                this.image.imageUri = resp.data.url
                this.image.content = ret.base64.replace('data:image/jpeg;base64,', '')
                this.$emit('on-success', this.image)
              }).catch(err => {
                console.log('-----上传图片失败---', err)
              })
            }).catch(err => {
              console.log('压缩图片失败', err)
            })
          }).catch(err => {
            console.log('获取token失败', err)
          })
        }
      }
    }
  }
</script>

<style scoped rel="stylesheet/scss" lang="scss">

  .progress-row {
    position: absolute;
    padding: 0 15px 5px 2px;
    top: -25px;
    right: 45px;
    left: 22px;
  }
  .choice-block {
    width: 100%;
    height: 100%;
    overflow: hidden;
    .choice-image {
      position: absolute;
      display: none;
      width: 20px;
      height: 20px;
      opacity: 0;
      overflow: hidden;
      z-index: -1;
    }
    .file-label {
      cursor: pointer;
    }
  }


</style>

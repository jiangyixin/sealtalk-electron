<template>
  <div class="choice-block">
    <label class="file-label">
      <input @change="handleChange" class="choice-file" type="file">
      <slot>
        <icon name="folder-o"></icon>
      </slot>
    </label>
    <div v-if="percentage > 0 && percentage < 100" class="progress-row">
      <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage"></el-progress>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { getQiniuToken } from '../../api/qiniu'
  import axios from 'axios'

  export default {
    name: 'File',
    props: {
      autoUpload: {
        type: Boolean,
        default: true
      },
      showPercentage: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      ...mapGetters(['userId'])
    },
    data () {
      return {
        percentage: 0,
        file: {
          name: '',
          type: '',
          size: '',
          fileUrl: ''
        },
        uploadUrl: 'https://upload.qiniu.com/'
      }
    },
    created () {

    },
    methods: {
      handleChange (e) {
        let file = e.target.files[0]
        if (file) {
          this.$emit('on-preview', file)
          if (this.autoUpload) {
            this.uploadToQiniu(e)
          }
        }
      },
      uploadToQiniu (e) {
        let file = e.target.files[0]
        if (file) {
          this.file.name = file.name
          this.file.size = file.size
          this.file.type = file.name.split('.').pop()
          let param = new FormData()
          param.append('file', file, file.name)
          getQiniuToken().then(data => {
            param.append('token', data.token)
            // param.append('key', `sealtalk/${this.userId}/${Date.now()}-${file.name}`)
            let config = {
              headers:{'Content-Type':'multipart/form-data'},
              onUploadProgress: progressEvent => {
                let percentage = (progressEvent.loaded / progressEvent.total * 100 | 0)
                if (this.showPercentage) {
                  this.percentage = percentage
                }
                this.$emit('on-progress', percentage)
              }
            }
            axios.post(this.uploadUrl, param, config).then(resp => {
              this.file.fileUrl = resp.data.url
              this.$emit('on-success', this.file)
            }).catch(err => {
              console.log('-----上传文件失败---', err)
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
    .choice-file {
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

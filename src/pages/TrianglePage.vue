<template>
  <div class="page-wrapper flex" :model="form">
    <el-form label-width="60px">
      <el-form-item label="方向：">
        <div class="triangle-box">
          <div class="box-content">
            <div class="box-center"></div>
            <div
              class="box-top box-item box-inside"
              :class="[form.direction === 'top' ? 'active' : '']"
              @click="handleChangeDirection('top')"
            ></div>
            <div
              class="box-bottom box-item box-inside"
              :class="[form.direction === 'bottom' ? 'active' : '']"
              @click="handleChangeDirection('bottom')"
            ></div>
            <div
              class="box-left box-item box-inside"
              :class="[form.direction === 'left' ? 'active' : '']"
              @click="handleChangeDirection('left')"
            ></div>
            <div
              class="box-right box-item box-inside"
              :class="[form.direction === 'right' ? 'active' : '']"
              @click="handleChangeDirection('right')"
            ></div>
            <div
              class="box-top-left box-item"
              :class="[form.direction === 'top-left' ? 'active' : '']"
              @click="handleChangeDirection('top-left')"
            ></div>
            <div
              class="box-top-right box-item"
              :class="[form.direction === 'top-right' ? 'active' : '']"
              @click="handleChangeDirection('top-right')"
            ></div>
            <div
              class="box-bottom-left box-item"
              :class="[form.direction === 'bottom-left' ? 'active' : '']"
              @click="handleChangeDirection('bottom-left')"
            ></div>
            <div
              class="box-bottom-right box-item"
              :class="[form.direction === 'bottom-right' ? 'active' : '']"
              @click="handleChangeDirection('bottom-right')"
            ></div>
            <el-radio-group v-model="form.direction">
              <el-radio class="radio-top flex-col-reverse" label="top">上</el-radio>
              <el-radio class="radio-bottom flex-col" label="bottom">下</el-radio>
              <el-radio class="radio-left flex-row-reverse" label="left">左</el-radio>
              <el-radio class="radio-right" label="right">右</el-radio>
              <el-radio class="radio-top-left flex-row-reverse" label="top-left">左上</el-radio>
              <el-radio class="radio-top-right" label="top-right">右上</el-radio>
              <el-radio class="radio-bottom-left flex-row-reverse" label="bottom-left">左下</el-radio>
              <el-radio class="radio-bottom-right" label="bottom-right">右下</el-radio>
            </el-radio-group>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="形状：">
        <el-radio-group v-model="form.shape" @change="handleChangeShape">
          <el-radio label="1">等腰</el-radio>
          <el-radio label="2" v-if="form.direction.indexOf('-') < 0">等边</el-radio>
          <el-radio label="3">不等边</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="颜色：">
        <el-color-picker v-model="form.color" show-alpha />
      </el-form-item>
      <el-form-item class="form-item" label="大小：">
        <div class="form-input-row">
          <el-input-number
            class="input-item item1"
            v-model="form.width"
            :min="0"
            :max="400"
            :step="1"
            :disabled="disabledWidth"
            :controls="!disabledWidth"
            @change="handleChangeWidth"
          />
          <el-input-number
            class="input-item item2"
            v-model="form.leftWidth"
            :min="0"
            :max="400"
            :step="1"
            :controls="!disabledSideWidth"
            :disabled="disabledSideWidth"
            @change="handleChangeSideWidth"
          />
          <el-input-number
            class="input-item item3"
            v-model="form.rightWidth"
            :min="0"
            :max="400"
            :step="1"
            :controls="!disabledSideWidth"
            :disabled="disabledSideWidth"
            @change="handleChangeSideWidth"
          />
        </div>
        <div class="form-input-row">
          <el-input-number
            class="input-item item4"
            v-model="form.height"
            :disabled="disabledHeight"
            :controls="!disabledHeight"
            :min="0"
            :max="400"
            :step="1"
            @change="handleChangeHeight"
          />
          <el-input-number
            class="input-item item5"
            v-model="form.topHeight"
            :min="0"
            :max="400"
            :step="1"
            :disabled="disabledSideHeight"
            :controls="!disabledSideHeight"
            @change="handleChangeSideHeight"
          />
          <el-input-number
            class="input-item item6"
            v-model="form.bottomHeight"
            :min="0"
            :max="400"
            :step="1"
            :disabled="disabledSideHeight"
            :controls="!disabledSideHeight"
            @change="handleChangeSideHeight"
          />
        </div>
      </el-form-item>
    </el-form>
    <div class="page-right">
      <div class="right-show">
        <div class="triangle" :style="triangleStyle"></div>
      </div>
      <div class="right-code">
        <highlightjs
          autodetect
          :code="triangleCode"
        ></highlightjs>
        <el-tooltip
          effect="light"
          content="复制代码"
          placement="top-end"
        >
          <el-icon class="copy-btn" :data-clipboard-text="triangleCode">
            <component :is="'CopyDocument'"></component>
          </el-icon>
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import ClipboardJS from 'clipboard'
import { ElNotification } from 'element-plus'
import { stripNumber } from '../utils/func'

const form = reactive({
  direction: 'top',
  shape: '1',
  color: '#F94C10',
  width: 200,
  leftWidth: 100,
  rightWidth: 100,
  height: 200,
  topHeight: 100,
  bottomHeight: 100
})

const disabledWidth = computed(() => {
  return (['left', 'right'].includes(form.direction) && form.shape === '2') || (['top', 'bottom'].includes(form.direction) && form.shape === '3')
})

const disabledSideWidth = computed(() => {
  return ['1', '2'].includes(form.shape) || (!['top', 'bottom'].includes(form.direction) && form.shape === '3')
})

const disabledHeight = computed(() => {
  return (['top', 'bottom'].includes(form.direction) && form.shape === '2') || (['left', 'right'].includes(form.direction) && form.shape === '3')
})

const disabledSideHeight = computed(() => {
  return ['1', '2'].includes(form.shape) || (!['left', 'right'].includes(form.direction) && form.shape === '3')
})

const triangleStyle = computed(() => {
  let borderWidth = '', borderColor = ''
  const { direction, shape, color, width, leftWidth, rightWidth, height, topHeight, bottomHeight } = form
  switch (direction) {
    case 'top':
      borderColor = `transparent transparent ${color} transparent`
      if (['1', '3'].includes(shape)) {
        borderWidth = `0 ${rightWidth}px ${width}px ${leftWidth}px`
      } else if (shape === '2') {
        borderWidth = `0 ${rightWidth}px ${(width * Math.sqrt(3) / 2).toFixed(1)}px ${leftWidth}px`
      }
      break
    case 'bottom':
      borderColor = `${color} transparent transparent transparent`
      if (['1', '3'].includes(shape)) {
        borderWidth = `${width}px ${rightWidth}px 0 ${leftWidth}px`
      } else if (shape === '2') {
        borderWidth = `${(width * Math.sqrt(3) / 2).toFixed(1)}px ${rightWidth}px 0 ${leftWidth}px`
      }
      break
    case 'left':
      borderColor = `transparent ${color} transparent transparent`
      if (['1', '3'].includes(shape)) {
        borderWidth = `${topHeight}px ${width}px ${bottomHeight}px 0`
      } else if (shape === '2') {
        borderWidth = `${topHeight}px ${(height * Math.sqrt(3) / 2).toFixed(1)}px ${bottomHeight}px 0`
      }
      break
    case 'right':
      borderColor = `transparent transparent transparent ${color}`
      if (['1', '3'].includes(shape)) {
        borderWidth = `${topHeight}px 0 ${bottomHeight}px ${width}px`
      } else if (shape === '2') {
        borderWidth = `${topHeight}px 0 ${bottomHeight}px ${(height * Math.sqrt(3) / 2).toFixed(1)}px`
      }
      break
    case 'top-left':
      borderColor = `${color} transparent transparent transparent`
      borderWidth = `${height}px ${width}px 0 0`
      break
    case 'top-right':
      borderColor = `transparent ${color} transparent transparent`
      borderWidth = `0 ${width}px ${height}px 0`
      break
    case 'bottom-left':
      borderColor = `transparent transparent transparent ${color}`
      borderWidth = `${height}px 0 0 ${width}px`
      break
    case 'bottom-right':
      borderColor = `transparent transparent ${color} transparent`
      borderWidth = `0 0 ${height}px ${width}px`
      break
  }
  return { borderWidth, borderColor }
})

const triangleCode = computed(() => {
  return `width: 0;\nheight: 0;\nborder-style: solid;\nborder-width: ${triangleStyle.value.borderWidth};\nborder-color: ${triangleStyle.value.borderColor};`
})

const handleChangeDirection = (val) => {
  form.direction = val
  if (val.indexOf('-') >= 0 && form.shape === '1') {
    form.height = form.width
  } else if (val.indexOf('-') >= 0 && form.shape === '2') {
    form.shape = '1'
  }
  if (disabledSideWidth.value) {
    form.leftWidth = form.rightWidth = stripNumber(form.width / 2)
  }
  if (disabledSideHeight.value) {
    form.topHeight = form.bottomHeight = stripNumber(form.height / 2)
  }
}

const handleChangeShape = (val) => {
  if (val === '1' && form.direction.indexOf('-') >= 0) {
    form.height = form.width
  }
  if (disabledSideWidth.value) {
    form.leftWidth = form.rightWidth = stripNumber(form.width / 2)
  }
  if (disabledSideHeight.value) {
    form.topHeight = form.bottomHeight = stripNumber(form.height / 2)
  }
}

const handleChangeWidth = (val) => {
  form.leftWidth = form.rightWidth = stripNumber(val / 2)
  if (form.direction.indexOf('-') >= 0 && form.shape === '1') {
    form.height = val
    form.topHeight = form.bottomHeight = stripNumber(val / 2)
  }
}

const handleChangeSideWidth = () => {
  form.width = form.leftWidth + form.rightWidth
}

const handleChangeHeight = (val) => {
  form.topHeight = form.bottomHeight = stripNumber(val / 2)
  if (form.direction.indexOf('-') >= 0 && form.shape === '1') {
    form.width = val
    form.leftWidth = form.rightWidth = stripNumber(val / 2)
  }
}

const handleChangeSideHeight = () => {
  form.height = form.topHeight + form.bottomHeight
}

onMounted(() => {
  const clipboard = new ClipboardJS('.copy-btn')
  clipboard.on('success', function (e) {
    ElNotification({
      title: '提示',
      message: '复制成功',
      type: 'success',
    })
    e.clearSelection()
  })
  clipboard.on('error', function () {
    ElNotification({
      title: '提示',
      message: '复制失败，请重试',
      type: 'fail',
    })
  })
})

</script>

<style lang="less" scoped>
/deep/ .el-form-item__label {
  font-weight: 600;
}
.triangle-box {
  padding: 150px 120px 130px;
  .box-content {
    width: 100px;
    height: 100px;
    position: relative;
  }
  .box-center {
    width: 100px;
    height: 100px;
    position: absolute;
    background-color: #fff;
    z-index: 20;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .box-item {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    cursor: pointer;
    transition: all 0.15s;
  }
  .box-inside {
    width: 70.7px;
    height: 70.7px;
    z-index: 10;
    border: none;
    background-color: #6F61C0;
    &.active {
      background-color: #8BE8E5;
    }
  }
  .box-top {
    left: 0;
    top: 0;
    transform: rotate(-45deg);
    transform-origin: left top;
  }
  .box-bottom {
    left: 0;
    bottom: 0;
    transform: rotate(45deg);
    transform-origin: left bottom;
  }
  .box-left {
    left: 0;
    top: 0;
    transform: rotate(45deg);
    transform-origin: left top;
  }
  .box-right {
    top: 0;
    right: 0;
    transform: rotate(-45deg);
    transform-origin: right top;
  }
  .box-top-left {
    border-width: 100px 100px 0 0;
    border-color: #A084E8 transparent transparent transparent;
    left: -50px;
    top: -50px;
    &.active {
      border-color: #8BE8E5 transparent transparent transparent;
    }
  }
  .box-top-right {
    border-width: 0 100px 100px 0;
    border-color: transparent #A084E8 transparent transparent;
    right: -50px;
    top: -50px;
    &.active {
      border-color: transparent #8BE8E5 transparent transparent;
    }
  }
  .box-bottom-left {
    border-width: 100px 0 0 100px;
    border-color: transparent transparent transparent #A084E8;
    left: -50px;
    bottom: -50px;
    &.active {
      border-color: transparent transparent transparent #8BE8E5;
    }
  }
  .box-bottom-right {
    border-width: 0 0 100px 100px;
    border-color: transparent transparent #A084E8 transparent;
    right: -50px;
    bottom: -50px;
    &.active {
      border-color: transparent transparent #8BE8E5 transparent;
    }
  }
  .radio-top {
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    /deep/ .el-radio__label {
      margin: 0;
      padding: 0;
    }
  }
  .radio-bottom {
    position: absolute;
    bottom: -100px;
    left: 50%;
    transform: translateX(-50%);
    /deep/ .el-radio__label {
      margin: 0;
      padding: 0;
    }
  }
  .radio-left {
    position: absolute;
    left: -108px;
    top: 50%;
    transform: translateY(-50%);
    /deep/ .el-radio__label {
      padding: 0 8px 0 0;
    }
  }
  .radio-right {
    position: absolute;
    right: -140px;
    top: 50%;
    transform: translateY(-50%);
  }
  .radio-top-left {
    position: absolute;
    left: -112px;
    top: -88px;
    /deep/ .el-radio__label {
      padding: 0;
      position: relative;
      top: -15px;
      left: 3px;
      transform: rotate(-45deg);
    }
  }
  .radio-top-right {
    position: absolute;
    right: -145px;
    top: -88px;
    /deep/ .el-radio__label {
      padding: 0;
      position: relative;
      top: -15px;
      right: 4px;
      transform: rotate(45deg);
    }
  }
  .radio-bottom-left {
    position: absolute;
    left: -112px;
    bottom: -88px;
    /deep/ .el-radio__label {
      padding: 0;
      position: relative;
      bottom: -15px;
      left: 3px;
      transform: rotate(-135deg);
    }
  }
  .radio-bottom-right {
    position: absolute;
    right: -112px;
    bottom: -88px;
    /deep/ .el-radio__label {
      padding: 0;
      position: relative;
      bottom: -15px;
      right: 3px;
      transform: rotate(135deg);
    }
  }
}
.form-item {
  /deep/ .el-form-item__content {
    flex-direction: column;
  }
}
.form-input-row {
  display: block;
  margin-bottom: 30px;
  .input-item {
    margin-right: 10px;
    position: relative;
    &::after {
      position: absolute;
      bottom: -28px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
    }
    &.item1::after {
      content: '宽度';
    }
    &.item2::after {
      content: '左';
    }
    &.item3::after {
      content: '右';
    }
    &.item4::after {
      content: '高度';
    }
    &.item5::after {
      content: '上';
    }
    &.item6::after {
      content: '下';
    }
  }
}
.page-right {
  .right-show {
    width: 440px;
    height: 440px;
    background: url('../assets/transparent.png') 0 0 repeat;
    position: relative;
    overflow: hidden;
    .triangle {
      width: 0;
      height: 0;
      border-style: solid;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
  .right-code {
    position: relative;
    overflow: hidden;
    /deep/ .hljs {
      width: 440px;
      min-height: 180px;
    }
    .copy-btn {
      position: absolute;
      right: 10px;
      bottom: 10px;
      z-index: 100;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
    }
  }
}
</style>
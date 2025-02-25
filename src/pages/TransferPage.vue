<template>
  <div class="page-wrapper page-transfer flex">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">时间转换</div>
      </template>
      <el-form label-width="60px" :model="timeForm">
        <el-form-item label="现在">{{ timeForm.now }}</el-form-item>
        <el-form-item label="时间">
          <el-input v-model="timeForm.input" @input="handleInputTime" />
        </el-form-item>
        <el-form-item label="格式">
          <el-radio-group v-model="timeForm.type" @change="handleInputTime">
            <el-radio label="timestampH">时间戳(毫秒)</el-radio>
            <el-radio label="timestamp">时间戳(秒)</el-radio>
            <el-radio label="">自定义</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="自定义" v-if="timeForm.type === ''">
          <el-input v-model="timeForm.format" @input="handleInputTime" />
        </el-form-item>
        <el-form-item label="结果">
          <el-input v-model="timeForm.result" disabled />
        </el-form-item>
        <el-form-item>
          <el-button class="copy-btn" type="primary" :data-clipboard-text="timeForm.result">复制</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">颜色转换</div>
      </template>
      <el-form label-width="60px" :model="timeForm">
        <el-form-item label="输入">
          <el-input v-model="colorForm.input" @input="handleInputColor" />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="colorForm.color" show-alpha />
        </el-form-item>
        <el-form-item label="格式">
          <el-radio-group v-model="colorForm.format" @change="handleInputColor">
            <el-radio label="hex" />
            <el-radio label="rgb" />
            <el-radio label="rgba" />
            <el-radio label="hsl" />
            <el-radio label="hsla" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="结果">
          <el-input v-model="colorForm.result" disabled />
        </el-form-item>
        <el-form-item>
          <el-button class="copy-btn" type="primary" :data-clipboard-text="colorForm.result">复制</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import chroma from 'chroma-js'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

const timeForm = ref({
  now: dayjs().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss dddd'),
  input: '',
  type: 'timestampH',
  format: 'YYYY-MM-DD HH:mm:ss dddd',
  result: ''
})

const colorForm = ref({
  input: '',
  color: '#ffffff',
  format: 'hex',
  result: ''
})

const handleInputTime = () => {
  const { input, type, format } = timeForm.value
  let res = ''
  if (dayjs(input).isValid()) {
    if (type === 'timestampH') {
      res = dayjs(input).valueOf()
    } else if (type === 'timestamp') {
      res = dayjs(input).unix()
    } else {
      res = dayjs(input).locale('zh-cn').format(format)
    }
  } else {
    res = ''
  }
  timeForm.value.result = res
}

const handleInputColor = () => {
  const { input, format } = colorForm.value
  const valid = chroma.valid(input)
  if (valid) {
    colorForm.value.color = input
    if (format === 'hex') {
      colorForm.value.result = chroma(input).hex()
    } else if (format === 'rgb') {
      colorForm.value.result = `rgb(${chroma(input).rgb()})`
    } else if (format === 'rgba') {
      colorForm.value.result = `rgba(${chroma(input).rgba()})`
    } else if (format === 'hsl') {
      const hsl = chroma(input).hsl()
      colorForm.value.result = `hsl(${hsl[0] ? `${parseFloat(hsl[0].toFixed(3))}` : hsl[0]}, ${parseFloat((hsl[1] * 100).toFixed(3))}%, ${parseFloat((hsl[2] * 100).toFixed(3))}%)`
    } else if (format === 'hsla') {
      const hsl = chroma(input).hsl()
      colorForm.value.result = `hsl(${hsl[0] ? `${parseFloat(hsl[0].toFixed(3))}` : hsl[0]}, ${parseFloat((hsl[1] * 100).toFixed(3))}%, ${parseFloat((hsl[2] * 100).toFixed(3))}%, ${hsl[3]})`
    }
  } else {
    colorForm.value.color = '#ffffff'
    colorForm.value.result = ''
  }
}

onMounted(() => {
  setInterval(() => {
    timeForm.value.now = dayjs().locale('zh-cn').format('YYYY-MM-DD HH:mm:ss dddd')
  }, 1000)
})
</script>

<style lang="less" scoped>
.page-transfer {
  .box-card {
    // width: 500px;
    height: 500px;
    &:not(:first-child) {
      margin-left: 20px;
    }
    :deep(.el-card__header) {
      border-bottom: none;
    }
    .card-header {
      font-size: 15px;
      font-weight: 600;
    }
  }
}
</style>
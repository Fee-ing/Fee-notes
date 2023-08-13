<template>
  <div class="page-wrapper page-shadow">
    <div class="flex">
      <el-card class="box-card ps-card">
        <template #header>
          <div class="card-header">Photoshop投影参数</div>
        </template>
        <el-form label-width="90px" :model="psForm">
          <el-form-item class="form-item multi-input" label="颜色：">
            <el-input-number
              class="input-item item1"
              v-model="psForm.colorR"
              :min="0"
              :max="400"
              :step="1"
              step-strictly
            />
            <el-input-number
              class="input-item item2"
              v-model="psForm.colorG"
              :min="0"
              :max="255"
              :step="1"
              step-strictly
            />
            <el-input-number
              class="input-item item3"
              v-model="psForm.colorB"
              :min="0"
              :max="255"
              :step="1"
              step-strictly
            />
          </el-form-item>
          <el-form-item class="form-item" label="不透明度：">
            <el-input-number
              v-model="psForm.opacity"
              :min="0"
              :max="100"
              :step="1"
              step-strictly
            />
            <span class="item-text">%</span>
          </el-form-item>
          <el-form-item class="form-item" label="角度：">
            <el-input-number
              v-model="psForm.angle"
              :min="0"
              :max="360"
              :step="1"
              step-strictly
            />
            <span class="item-text">°</span>
          </el-form-item>
          <el-form-item class="form-item" label="距离：">
            <el-input-number
              v-model="psForm.distance"
              :min="0"
              :max="1000"
              :step="1"
              step-strictly
            />
            <span class="item-text">px</span>
          </el-form-item>
          <el-form-item class="form-item" label="扩展：">
            <el-input-number
              v-model="psForm.spread"
              :min="0"
              :max="100"
              :step="1"
              step-strictly
            />
            <span class="item-text">%</span>
          </el-form-item>
          <el-form-item class="form-item" label="大小：">
            <el-input-number
              v-model="psForm.size"
              :min="0"
              :max="1000"
              :step="1"
              step-strictly
            />
            <span class="item-text">px</span>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="box-card">
        <template #header>
          <div class="card-header">CSS3参数</div>
        </template>
        <el-form label-width="100px" :model="cssForm">
          <el-form-item class="form-item" label="内阴影：">
            <el-switch v-model="cssForm.inset" />
          </el-form-item>
          <el-form-item class="form-item" label="水平偏移量：">
            <el-input-number
              v-model="cssForm.offsetX"
              :min="0"
              :max="1000"
              :step="1"
              step-strictly
            />
            <span class="item-text">px</span>
          </el-form-item>
          <el-form-item class="form-item" label="垂直偏移量：">
            <el-input-number
              v-model="cssForm.offsetY"
              :min="0"
              :max="1000"
              :step="1"
              step-strictly
            />
            <span class="item-text">px</span>
          </el-form-item>
          <el-form-item class="form-item" label="模糊距离：">
            <el-input-number
              v-model="cssForm.blurRadius"
              :min="0"
              :max="100"
              :step="1"
              step-strictly
            />
            <span class="item-text">px</span>
          </el-form-item>
          <el-form-item class="form-item" label="阴影尺寸：">
            <el-input-number
              v-model="cssForm.spread"
              :min="0"
              :max="1000"
              :step="1"
              step-strictly
            />
            <span class="item-text">px</span>
          </el-form-item>
          <el-form-item class="form-item" label="不透明度：">
            <el-input-number
              v-model="cssForm.opacity"
              :min="0"
              :max="100"
              :step="1"
              step-strictly
            />
            <span class="item-text">%</span>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <div class="flex over-h">
      <div class="page-code">
        <highlightjs
          autodetect
          :code="shadowCode"
        ></highlightjs>
        <el-tooltip
          effect="light"
          content="重置数据"
          placement="top-end"
        >
          <el-icon class="refresh-btn btn" @click="handleResetData">
            <component :is="'Refresh'"></component>
          </el-icon>
        </el-tooltip>
        <el-tooltip
          effect="light"
          content="复制代码"
          placement="top-end"
        >
          <el-icon class="copy-btn btn" :data-clipboard-text="shadowCode">
            <component :is="'CopyDocument'"></component>
          </el-icon>
        </el-tooltip>
      </div>
      <div class="show-wrapper flex-vh">
        <div class="show-box flex-vh" :style="shadowStyle">字</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const initialData = {
  colorR: 0,
  colorG: 0,
  colorB: 0,
  opacity: 75,
  angle: 120,
  distance: 5,
  spread: 0,
  size: 5
}

const psForm = ref(JSON.parse(JSON.stringify(initialData)))

const transToCSS = () => {
  const _angle = (180 - psForm.value.angle) * 3.14 / 180
  const offsetY = Math.round(Math.sin(_angle) * psForm.value.distance)
  const offsetX = Math.round(Math.cos(_angle) * psForm.value.distance)
  const spread = psForm.value.size * psForm.value.spread / 100
  const blurRadius = psForm.value.size - spread
  return { offsetX, offsetY, blurRadius, spread, opacity: psForm.value.opacity }
}

const cssForm = ref({
  inset: false,
  ...transToCSS()
})

const shadowStyle = computed(() => {
  const { colorR, colorG, colorB } = psForm.value
  const { inset, offsetX, offsetY, blurRadius, spread, opacity } = cssForm.value
  return {
    boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px ${spread}px rgba(${colorR}, ${colorG}, ${colorB}, ${opacity / 100})${inset ? ' inset' : ''}`,
    textShadow: `${offsetX}px ${offsetY}px ${blurRadius}px rgba(${colorR}, ${colorG}, ${colorB}, ${opacity / 100})`
  }
})

const shadowCode = computed(() => {
  return `box-shadow: ${shadowStyle.value.boxShadow};\ntext-shadow: ${shadowStyle.value.textShadow};`
})

const isChanged = ref(false)

watch(psForm.value, () => {
  isChanged.value = true
  cssForm.value = {
    inset: cssForm.value.inset,
    ...transToCSS()
  }
})

const handleResetData = () => {
  for (const key in initialData) {
    if (Object.hasOwnProperty.call(initialData, key)) {
      psForm.value[key] = initialData[key]
    }
  }
  if (!isChanged.value) {
    cssForm.value = {
      inset: false,
      ...transToCSS()
    }
    isChanged.value = false
  }
}
</script>

<style lang="less" scoped>
.page-shadow {
  .box-card {
    margin-bottom: 20px;
    &.ps-card {
      width: 540px;
    }
    &:not(:first-child) {
      margin-left: 20px;
    }
    .card-header {
      font-size: 15px;
      font-weight: 600;
    }
    .form-item {
      &.multi-input {
        margin-bottom: 30px;
        :deep(.el-form-item__content) {
          flex-wrap: nowrap;
        }
      }
      .item-text {
        margin-left: 10px;
        color: var(--el-menu-active-color);
      }
    }
    .input-item {
      margin-right: 10px;
      position: relative;
      &::after {
        position: absolute;
        bottom: -28px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        color: var(--el-menu-active-color);
      }
      &.item1::after {
        content: 'R';
      }
      &.item2::after {
        content: 'G';
      }
      &.item3::after {
        content: 'B';
      }
    }
  }
  .show-wrapper {
    width: 310px;
    overflow: hidden;
    padding-bottom: 10px;
    .show-box {
      width: 100px;
      height: 100px;
      font-size: 20px;
    }
  }
  :deep(.hljs) {
    width: 540px;
    height: 180px;
  }
}
</style>
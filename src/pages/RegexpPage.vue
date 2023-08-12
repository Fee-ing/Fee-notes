<template>
  <div class="page-wrapper page-regexp flex">
    <el-form class="form-wrapper" label-position="top">
      <el-form-item label="正则表达式">
        <el-input
          v-model="form.input"
          type="textarea"
          resize="none"
          placeholder="请先输入正确的正则表达式"
        />
      </el-form-item>
      <el-form-item label="匹配内容">
        <div class="input-wrapper" :class="[inputClass, regexp ? '' : 'disabled']">
          <div class="input-content">
            <div
              class="input-item input"
              id="input-show"
              :contenteditable="Boolean(regexp)"
              @input="handleInput"
              @focus="inputClass = 'focus'"
              @blur="inputClass = ''"
            ></div>
            <div
              class="input-item result"
              contenteditable="true"
              v-html="form.result"
            ></div>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const form = ref({ input: '', result: '', text: '' })

const inputClass = ref('')

const regexp = computed(() => {
  const { input } = form.value
  let reg = null
  try {
    reg = eval(input)
  } catch (error) {
    console.log(error)
    return null
  }
  if (Object.prototype.toString.call(reg) !== '[object RegExp]') return null
  return reg
})

const regexpExec = () => {
  if (!regexp.value) return
  const { text } = form.value
  let res = []
  while (regexp.value.exec(text))
  {
    res.push(regexp.value.lastIndex - 1)
  }
  let html = ''
  for (let index = 0; index < text.length; index++) {
    if (res.includes(index)) {
      html += `<b>${text[index]}</b>`
    } else {
      html += `<i>${text[index]}</i>`
    }
  }
  form.value.result = html
}

const handleInput = (e) => {
  form.value.text = e.target.innerText
  regexpExec()
}
</script>

<style lang="less" scoped>
.page-regexp {
  .form-wrapper {
    width: 400px;
  }
  .input-wrapper {
    width: 100%;
    height: 200px;
    line-height: 1.5;
    padding: 5px 11px;
    background-color: var(--el-input-bg-color,var(--el-fill-color-blank));
    box-shadow: 0 0 0 1px var(--el-input-border-color,var(--el-border-color)) inset;
    border-radius: var(--el-input-border-radius,var(--el-border-radius-base));
    transition: var(--el-transition-box-shadow);
    &:hover {
      box-shadow: 0 0 0 1px var(--el-border-color-hover) inset;
    }
    &.focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
    &.disabled {
      background-color: var(--el-disabled-bg-color);
      box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
      cursor: not-allowed;
      :deep(b) {
        background-color: transparent !important;
      }
      :deep(i) {
        background-color: transparent !important;
      }
    }
    .input-content {
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    .input-item {
      position: absolute;
      left: 0;
      top: 0;
      outline: none;
      overflow-y: auto;
      background-color: transparent;
      &.input {
        width: 100%;
        height: 100%;
        z-index: 10;
        color: transparent;
        caret-color: red;
      }
      &.result {
        color: var(--el-input-text-color,var(--el-text-color-regular));
        :deep(b) {
          font-style: normal;
          font-weight: normal;
          background-color: #FCFF99;
          &.select {
            opacity: 0;
          }
        }
        :deep(i) {
          font-style: normal;
          font-weight: normal;
          background-color: #fff;
          &.select {
            opacity: 0;
          }
        }
      }
    }
  }
}
</style>
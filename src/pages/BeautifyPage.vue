<template>
  <div class="page-wrapper page-beautify flex">
    <el-input class="code-input flex-1" v-model="form.code" type="textarea" placeholder="请输入代码" resize="none" />
    <div class="code-wrapper flex-1">
      <highlightjs
        autodetect
        :code="beautifyCode"
      ></highlightjs>
    </div>
    <el-form class="form-wrapper" label-position="top" :model="form.options">
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleStart">美化</el-button>
        <el-button class="copy-btn" type="primary" text bg :data-clipboard-text="form.beautify">复制</el-button>
        <el-button type="primary" text bg @click="handleClear">清空</el-button>
        <el-button type="primary" text bg @click="handleReset">重置</el-button>
      </el-form-item>
      <el-form-item label="代码类型：">
        <el-select v-model="form.options.parser">
          <el-option
            v-for="item in codeParserOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="单行长度：">
        <el-input-number
          v-model="form.options.printWidth"
          :min="1"
          :max="1000"
          :step="1"
          step-strictly
        />
      </el-form-item>
      <el-form-item label="缩进空格：">
        <el-input-number
          v-model="form.options.tabWidth"
          :min="1"
          :max="4"
          :step="1"
          step-strictly
        />
      </el-form-item>
      <el-form-item label="句末使用分号：">
        <el-switch v-model="form.options.semi" />
      </el-form-item>
      <el-form-item label="使用单引号：">
        <el-switch v-model="form.options.singleQuote" />
      </el-form-item>
      <el-form-item label="对象前后添加空格：">
        <el-switch v-model="form.options.bracketSpacing" />
      </el-form-item>
      <el-form-item label="多属性HTML标签的>折行放置：">
        <el-switch v-model="form.options.bracketSameLine" />
      </el-form-item>
      <el-form-item label="箭头函数参数包裹括号：">
        <el-radio-group v-model="form.options.arrowParens">
          <el-radio label="always">css</el-radio>
          <el-radio label="avoid">avoid</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-collapse>
        <el-collapse-item title="其他设置">
          <el-form-item label="JSX中使用单引号：">
            <el-switch v-model="form.options.jsxSingleQuote" />
          </el-form-item>
          <el-form-item label="JSX中的多属性HTML标签的>折行放置：">
            <el-switch v-model="form.options.jsxBracketSameLine" />
          </el-form-item>
          <el-form-item label="对HTML全局空白的敏感度：">
            <el-radio-group v-model="form.options.htmlWhitespaceSensitivity">
              <el-radio label="css">css</el-radio>
              <el-radio label="strict">strict</el-radio>
              <el-radio label="ignore">ignore</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="对Vue文件中的script、style标签缩进：">
            <el-switch v-model="form.options.vueIndentScriptAndStyle" />
          </el-form-item>
          <el-form-item label="在HTML、Vue和JSX文件中强制每行单一属性：">
            <el-switch v-model="form.options.singleAttributePerLine" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { ElNotification } from 'element-plus'
import { loadJs } from '../utils/func'

const codeParserOptions = [
  { label: '默认', value: 'babel' },
  { label: 'typescript', value: 'typescript' },
  { label: 'html', value: 'html' },
  { label: 'vue', value: 'vue' },
  { label: 'angular', value: 'angular' },
  { label: 'css', value: 'css' },
  { label: 'scss', value: 'scss' },
  { label: 'less', value: 'less' },
  { label: 'json', value: 'json' },
  { label: 'json5', value: 'json5' },
  { label: 'json-stringify', value: 'json-stringify' },
  { label: 'markdown', value: 'markdown' },
]

const initialData = {
  code: '',
  beautify: '',
  options: {
    parser: 'babel',
    printWidth: 80,
    tabWidth: 2,
    semi: false,
    singleQuote: true,
    jsxSingleQuote: true,
    bracketSpacing: true,
    bracketSameLine: true,
    jsxBracketSameLine: true,
    arrowParens: 'always',
    htmlWhitespaceSensitivity: 'css',
    vueIndentScriptAndStyle: false,
    singleAttributePerLine: false
  }
}

const form = reactive(JSON.parse(JSON.stringify(initialData)))

const loading = ref(false)

const beautifyCode = computed(() => {
  return `/** 格式化代码 */\n\n${form.beautify}`
})

const handleStart = async () => {
  const { code, options } = form
  if (code === '') return

  loading.value = true
  form.beautify = ''

  const { parser } = options
  let scripts = ['standalone', 'plugins/babel', 'plugins/estree']
  if (['html', 'vue'].includes(parser)) {
    scripts = [ ...scripts, 'plugins/html' ]
  } else if (['css', 'scss', 'less'].includes(parser)) {
    scripts = [ ...scripts, 'plugins/postcss' ]
  } else if (parser === 'angular') {
    scripts = [ ...scripts, 'plugins/html', 'plugins/angular' ]
  } else if (parser === 'typescript') {
    scripts = [ ...scripts, 'plugins/typescript' ]
  } else if (parser === 'markdown') {
    scripts = [ ...scripts, 'plugins/markdown' ]
  }
  for (let index = 0; index < scripts.length; index++) {
    const res = await loadJs(`https://unpkg.com/prettier@3.0.1/${scripts[index]}.js`)
    if (!res)  {
      ElNotification({
        title: '提示',
        message: '加载Prettier插件失败，请刷新重试',
        type: 'error',
      })
      loading.value = false
      return
    }
  }
  prettier.format(code, {
    ...options,
    plugins: prettierPlugins,
  }).then((res) => {
    form.beautify = res
    loading.value = false
  }).catch((err) => {
    console.log(err)
    ElNotification({
      title: '提示',
      message: '格式化失败，请检查代码类型',
      type: 'error',
    })
    loading.value = false
  })
  
}

const handleClear = () => {
  form.code = ''
  form.beautify = ''
}

const handleReset = () => {
  form.options = JSON.parse(JSON.stringify(initialData.options))
  form.code = ''
  form.beautify = ''
}
</script>

<style lang="less" scoped>
.page-beautify {
  padding: 0;
  .form-wrapper {
    width: 340px;
    max-height: 100%;
    overflow-y: auto;
    padding-top: 20px;
    :deep(.el-collapse-item__header) {
      border-bottom: none;
      font-weight: 600;
      color: var(--el-menu-active-color);
      font-size: var(--el-form-label-font-size);
    }
    :deep(.el-collapse-item__wrap) {
      border-bottom: none;
    }
  }
  .code-input {
    background-color: #fff;
    border-right: 1px solid rgb(228, 231, 237);
    :deep(.el-textarea__inner) {
      height: 100%;
      border: none;
      box-shadow: none;
      background-color: transparent;
      padding: 20px;
    }
  }
  .code-wrapper {
    margin-right: 20px;
    border-right: 1px solid rgb(228, 231, 237);
    :deep(pre) {
      height: 100%;
    }
    :deep(.hljs) {
      width: 100%;
      height: 100%;
      overflow-x: hidden;
      word-break: break-all;
      white-space: break-spaces;
    }
  }
}
</style>
const fs = require('fs')
const path = require('path')
const renderer = require('vue-server-renderer')
const Vue = require('vue')

const resolvePath = (src) => path.resolve(__dirname, src)

// 清除模板字符串的换行符
const clearEnter = (html) => {
  return html.replace(/[\r\n]/g, "")
}

// 将图片转成base64
const transGifToCSSFile = (imgPath) => {
  let ext = path.extname(imgPath).slice(1)
  let preStr = `data:image/${ext};base64,`
  let bitDate = fs.readFileSync(imgPath)
  let base64Str = bitDate.toString('base64')
  let dataURL = preStr + base64Str

  return dataURL
}

// 将base64插入到css文件中
const injectDataURLToCSS = (cssStr, dataURL) => {
  // css文件中图片路径替换成base64
  return cssStr.replace(/__inline__/, dataURL)
}

// 从vue单文件中抽取html和css
const extractAssetsInVueTpl = (vueTplPath) => {
  // 读取loading.vue文件，并清除换行和空格
  let vueTpl = clearEnter(fs.readFileSync(vueTplPath).toString())
  // 抽取template标签中的内容
  let html = /<template>(.*)<\/template>/g.exec(vueTpl)[1]
  // 抽取style标签内的内容
  let css = /<style>(.*)<\/style>/g.exec(vueTpl)[1]

  return {
    html,
    css
  }
}

let vueAssets = null
let vueTplPath = resolvePath('./loading/pre-render-loading.vue')
let gifPath = resolvePath('./loading/imgs/loading.gif')
let loading = {
  html: '',
  css: ''
}

// 将vue单文件中的template和css分别抽取出来
vueAssets = extractAssetsInVueTpl(vueTplPath)

;(async function () {
  await new Promise((resolve, reject) => {
    // vue-server-render的用法自行查看吧
    let vue = new Vue({
      template: vueAssets.html
    })

    let realRenderer = renderer.createRenderer({
      // <!--vue-ssr-outlet-->会替换成vue-ssr-render渲染出来的html
      template: '<!--vue-ssr-outlet-->'
    })

    realRenderer.renderToString(vue, (err, html) => {
      loading.html = html
      
      // 图片转成base64后插入到读取的css中
      let dataURL = transGifToCSSFile(gifPath)
      let cssStr = injectDataURLToCSS(vueAssets.css, dataURL)

      // 拼接样式到style标签中
      loading.css = '<style>' + cssStr + '</style>'
      
      resolve()
    })
  })
})()

// 导出的loading作为html-webpack-plugin的模板参数
module.exports = loading
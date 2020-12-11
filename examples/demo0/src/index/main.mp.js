import a from './a'
import b from './b'

export default function createApp() {
    const container = document.createElement('div')
    container.id = 'app'
    document.body.appendChild(container)

    // rem 和页面样式修改
    window.onload = function () {
        document.documentElement.style.fontSize = wx.getSystemInfoSync().screenWidth / 16 + 'px'
        document.documentElement.style.backgroundColor = '#fffbe7'
    }
    window.onerror = (message, source, lineno, colno, error) => {
        console.log('window.onerror => ', message, source, lineno, colno, error)
    };
    window.addEventListener('error', evt => console.log('window.addEventListener(\'error\') =>', evt))
}

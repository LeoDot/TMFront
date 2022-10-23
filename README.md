# create-tokylabs-v

The front end of create-tokylabs.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## npm重新安装node_modules方法
1. 安装rimraf ： cnpm install rimraf -g

2. 执行： rimraf node_modules  删除文件荚 

3. 清空缓存： npm cache clean --force

4. 重新安装淘宝镜像： npm install -g cnpm --registry=https://registry.npm.taobao.org

5. 再次执行：cnpm i

## nvm (node should be 14.20.0)
nvm use node
nvm use system

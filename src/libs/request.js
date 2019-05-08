import axios from 'axios'
import {Message,MessageBox}from 'element-ui'
import vueRouter from "../router";

// function getBaseUrl() {
//     let baseUrl = process.env.BASE_API
//     const hostName = window.location.hostname
//     if (hostName !== 'localhost') {
//         baseUrl = 'http://' + hostName
//     }
//     return baseUrl
// }

// 创建axios实例
const service = axios.create({
    //baseURL: 'http://localhost:2222', // api的base_url
    timeout: 10000, // 请求超时时间,
    // request payload
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    },
    // 修改请求数据,去除data.q中为空的数据项,只针对post请求

})

service.interceptors.request.use(config => {

    //过滤 登陆请求
    if (config.url.includes('login')){
        return config
    }
    let expire_ts = localStorage.getItem('expire_ts');
    if (expire_ts && parseInt(expire_ts) < (Date.now()/1000)){
        Message.error('token has been expired')
        return Promise.reject(null)
    }
    let token = localStorage.getItem('token')
    if (!token){
        Message.error('has no token jump to login page')
        return Promise.reject(null)
    }
    config.headers['Authorization'] = 'Bearer ' + token // 让每个请求携带自定义token 请根据实际情况自行修改


    return config;
}, error => {
    // 对请求错误做些什么
    Message.error("sending request is failed")
    // let loading = Loading.service({target:'#felix'});
    // loading.close();    //关闭加载前，记得重新定义实例
    return Promise.reject(error);
});

// http response 拦截器
service.interceptors.response.use(response => {
        let data = response.data
        if (data.ok){
            return data;
        }else {
            Message.error(data.msg)
            return {};
        }
    },
    error => {

        if (error.response && error.response.status === 412){

            MessageBox.confirm('未被授权，请重新登录', '重新登录', {
                confirmButtonText: '重新登录',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                vueRouter.push({name:"login"})
            })
            return Promise.reject(null)
        }

        return Promise.reject(error.response.data)

    });


export default service
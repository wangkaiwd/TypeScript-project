import {
  AxiosProps,
  AxiosPromise,
  AxiosRequestConfig,
  Method,
  AxiosResponse,
  ResolvedFn, RejectedFn
} from '../types'
import dispatchRequest from './dispatchRequest'
import InterceptorManage from './interceptorManage'

interface Interceptors {
  request: InterceptorManage<AxiosRequestConfig>;
  response: InterceptorManage<AxiosResponse>;
}
interface PromiseChain<T> {
  resolved: ResolvedFn<T> | ((config: AxiosRequestConfig) => AxiosPromise<T>);
  rejected?: RejectedFn;
}
export class Axios implements AxiosProps {
  interceptors: Interceptors

  constructor () {
    this.interceptors = {
      request: new InterceptorManage<AxiosRequestConfig>(),
      response: new InterceptorManage<AxiosResponse>()
    }
  }

  request (url: any, config?: any): AxiosPromise {
    // 支持不同的参数调用，可以直接通过url来进行调用：
    // axios(config)
    // axios(url,config?)
    if (typeof url === 'string') {
      if (!config) {config = {}}
      config.url = url

    } else {
      config = url
    }
    const chain: PromiseChain<any>[] = [{
      resolved: dispatchRequest,
      rejected: undefined
    }]
    this.interceptors.request.forEach(interceptor => {
      // Array.prototype.unshift: 将一个或多个元素添加到数组的开头，并返回该数组的新长度（该方法修改原有数组）
      chain.unshift(interceptor)
    })
    this.interceptors.response.forEach(interceptor => {
      chain.push(interceptor)
    })
    return dispatchRequest(config)
  }

  get (url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._mergeConfigWithoutData('get', url, config)
  }

  delete (url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._mergeConfigWithoutData('delete', url, config)
  }

  head (url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._mergeConfigWithoutData('head', url, config)
  }

  options (url: string, config?: AxiosRequestConfig): AxiosPromise {
    return this._mergeConfigWithoutData('options', url, config)
  }

  post (url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._mergeConfigWithData('post', url, data, config)
  }

  put (url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._mergeConfigWithData('put', url, data, config)
  }

  patch (url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise {
    return this._mergeConfigWithData('patch', url, data, config)
  }

  private _mergeConfigWithoutData (method: Method, url: string, config: AxiosRequestConfig = {}): AxiosPromise {
    // Object.assign: 将所有可枚举的属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。
    // 语法： Object.assign(target,...sources)
    // target: 目标对象， sources: 源对象
    // 如果目标对象中的属性具有相同的键，则属性将被源对象中的属性覆盖。后面的源对象的属性将类似地覆盖前面的源对象属性
    // return dispatchRequest(Object.assign(config, {
    //   method,
    //   url
    // }))
    return dispatchRequest({ method, url, ...config })
  }

  private _mergeConfigWithData (method: Method, url: string, data: any, config: AxiosRequestConfig = {}): AxiosPromise {
    return dispatchRequest({
      method,
      url,
      data,
      ...config
    })
  }
}

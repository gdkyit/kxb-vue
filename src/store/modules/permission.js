import { asyncRouterMap, constantRouterMap } from '@/router'
console.log(asyncRouterMap)
/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(authRoutes, route) {
  if (route.meta && route.meta.dm) {
    const rs = authRoutes.some(dm => route.meta.dm.indexOf(dm) >= 0)
    return rs
  } else {
    return true
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, authRoutes) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(authRoutes, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, authRoutes)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { authRoutes } = data
        let accessedRouters = []
        if (authRoutes && authRoutes.length > 0) {
          accessedRouters = filterAsyncRouter(asyncRouterMap, authRoutes)
        }
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission

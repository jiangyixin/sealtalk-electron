import Vue from 'vue'
import Router from 'vue-router'
import Index from '../views/Index'
import UserInfo from '../views/info/UserInfo'
import GroupInfo from '../views/info/GroupInfo'
import Chat from '../views/chat/Chat'
import Bulletin from '../views/group/Bulletin'
import ApplyFriend from '../views/friend/ApplyFriend'
import SearchFriend from '../views/friend/SearchFriend'
import Mass from '../views/mass/Index'
import Setting from '../views/my/Setting'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/chat/:conversationType/:targetId',
      name: 'Chat',
      component: Chat,
      props: (router) => ({
        conversationType: parseInt(router.params.conversationType),
        targetId: router.params.targetId + ''
      })
    },
    {
      path: '/user-info/:userId',
      name: 'UserInfo',
      component: UserInfo,
      props: (router) => ({
        userId: router.params.userId,
        applyFrom: router.query.applyFrom,
        fromRemark: router.query.fromRemark
      })
    },
    {
      path: '/apply-friend/:friendUserId',
      name: 'ApplyFriend',
      component: ApplyFriend,
      props: (router) => ({
        friendUserId: router.params.friendUserId,
        applyFrom: router.query.applyFrom,
        fromRemark: router.query.fromRemark
      })
    },
    {
      path: '/search-friend',
      name: 'SearchFriend',
      component: SearchFriend
    },
    {
      path: '/group-info/:groupId',
      name: 'GroupInfo',
      component: GroupInfo,
      props: true,
      meta: {
        isManage: false,
        roles: ['teacher', 'tutor']
      }
    },
    {
      path: '/group-info/:groupId/manage',
      name: 'GroupInfoManage',
      component: GroupInfo,
      props: true,
      meta: {
        isManage: true,
        roles: ['teacher', 'tutor']
      }
    },
    {
      path: '/group-bulletin/:groupId',
      name: 'Bulletin',
      component: Bulletin,
      props: true
    },
    {
      path: '/mass',
      name: 'Mass',
      component: Mass
    },
    {
      path: '/setting',
      name: 'Setting',
      component: Setting
    },
    {
      path: '/',
      name: 'Index',
      component: Setting
    }
  ]
})

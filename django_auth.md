

## Design for System Authentication in Django

一个Auth 系统需要提供三个基本功能: 

* assign_permission(permission, user): 给用户分配权限
* verify_permission(permission, user): 验证用户是否具有某项权限
* revoke_permission(permission, user): 撤销用户的某项权限



其中 Permission 是由 三元组组成， (permission_name, object_type, object_id)


为了管理方便， 因为现实世界的人是按照某种方式组织起来的， 所以， 我们引入 Group 的概念， Group 也是有权限的， 用户可以被分配到 Group 中， 这样用户就会自动获得 Group 的权限。


权限本身分为 读和写 read / write 两种， 读权限允许用户查看对象， 写权限允许用户修改对象。 另外， 我们还可以引入更细粒度的权限控制， 比如 delete, share 等等。




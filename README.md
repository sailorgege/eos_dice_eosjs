# eos_dice_eosjs

EOS的dice合约前端源码
===================================

源码说明：
-----------------------------------
为EOS的dice合约写了一套前端界面，可以通过浏览器，方便的与dice合约进行交互


使用说明：
-----------------------------------

1、将git下来的www_dice文件夹，放入eos目录下，与contracts、build、programs这些目录同级。

2、控制台进入到www_dice目录，安装依赖包：npm install --save

3、编译dice合约：
> cd ./contracts/dice
>
> eosiocpp -o dice.wast dice.cpp

4、启动eos节点：
> cd /你的eos所在父级目录/eos/build/programs/nodeos
>
> ./nodeos -e -p eosio --plugin eosio::wallet_api_plugin --plugin eosio::chain_api_plugin --plugin eosio::account_history_api_plugin

5、另起一个控制台，用户初始化钱包、合约等：
  cd /你的eos所在父级目录/eos

  // 创建钱包、导入私钥、创建及部署合约
> cleos wallet create
>
> cleos wallet unlock
>
> cleos wallet import 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3
>
> cleos wallet import 5Jmsawgsp1tQ3GD6JyGCwy1dcvqKZgX6ugMVMdjirx85iv5VyPR
>
> cleos create account eosio eosio.token EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4 EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4
>
> cleos set contract eosio.token build/contracts/eosio.token -p eosio.token
>
> cleos create account eosio dice EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4 EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4
>
> cleos set contract dice contracts/dice -p dice
>

  // 发行代币、创建玩家账号、为玩家分发代币、设置玩家账号权限
> cleos push action eosio.token create '[ "eosio", "1000000000.0000 EOS", 0, 0, 0]' -p eosio.token
>
> cleos create account eosio alice EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4 EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4
>
> cleos create account eosio bob EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4 EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4
>
> cleos push action eosio.token issue '[ "alice", "1000.0000 EOS", "" ]' -p eosio
>
> cleos push action eosio.token issue '[ "bob", "1000.0000 EOS", "" ]' -p eosio
>
> cleos set account permission alice active '{"threshold": 1,"keys": [{"key": "EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4","weight": 1}],"accounts": [{"permission":{"actor":"dice","permission":"active"},"weight":1}]}' owner -p alice
>
> cleos set account permission bob active '{"threshold": 1,"keys": [{"key": "EOS7ijWCBmoXBi3CgtK7DJxentZZeTkeUnaSDvyro9dq7Sd1C3dC4","weight": 1}],"accounts": [{"permission":{"actor":"dice","permission":"active"},"weight":1}]}' owner -p bob
>

6、再启动一个控制台，用于启动web服务：
> cd /你的eos所在父级目录/eos/www_dice
>
> npm run start
>

7、用浏览器打开（建议用Chrome浏览器，便于调试）：http://localhost:8080/

8、开始游戏。


演示视频：
-----------------------------------
> http://v.youku.com/v_show/id_XMzU5MzA2NjM4MA==.html
> 

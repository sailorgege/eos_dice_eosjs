import React from 'react'
import ReactDOM from 'react-dom'
import EOS from 'eosjs'

var {api, ecc, json, Fcbuffer, format} = EOS.modules

let contract_name = 'dice'
let account_name = 'alice'

const EOS_CONFIG = {
  contractName: contract_name, // Contract name
  contractSender: account_name, // User executing the contract (should be paired with private key)
  clientConfig: {
    //keyProvider: ['5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'], // Your eosio.token contract private key
    keyProvider: ['5Jmsawgsp1tQ3GD6JyGCwy1dcvqKZgX6ugMVMdjirx85iv5VyPR'], // Your dice or diceex contract private key
    httpEndpoint: 'http://127.0.0.1:8888' // EOS http endpoint
  }
}

class Dicedemo extends React.Component {
  constructor(props) {
    super(props)

    this._initLoadData = this._initLoadData.bind(this)

    this._refreshUIView = this._refreshUIView.bind(this)
    this._readGameData = this._readGameData.bind(this)
    this._readGameDataDelay = this._readGameDataDelay.bind(this)
    this._showLoading = this._showLoading.bind(this)

    this._getTableDiceExGame = this._getTableDiceExGame.bind(this)
    this._getTableDiceExOffer = this._getTableDiceExOffer.bind(this)
    this._getTableDiceExAccount = this._getTableDiceExAccount.bind(this)

    this._actionExecute = this._actionExecute.bind(this)
    this._playerDeposit = this._playerDeposit.bind(this)
    this._playerOfferbet = this._playerOfferbet.bind(this)
    this._playerReveal = this._playerReveal.bind(this)

    this.gamestate = {
      gamestate: 0,         // 0未开始，1已经开始，2游戏结束
      winner: 0,            // 哪个玩家胜出：1-alice，2-bob
      player1_state: 0,     // 0待充值，1待下注，2待开牌，3已开牌（account中没有该玩家，则为0待充值，有该玩家但offer中没有该玩家，则为1待下注，game中有玩家对应的游戏id、并且reveal为0，则为2待开牌）
      player2_state: 0,     // 0待充值，1待下注，2待开牌，3已开牌
      player1_balance: 0,   // 玩家1（alice）账户余额
      player2_balance: 0,   // 玩家2（bob）账户余额
      player1_offer: 0,     // 玩家1（alice）的下注状态
      player2_offer: 0,     // 玩家2（bob）的下注状态
      player1_gameid: 0,    // 玩家1（alice）的游戏id
      player2_gameid: 0,    // 玩家2（bob）的游戏id
      player1_name: 'alice',  // 玩家账户，这里固定代码
      player2_name: 'bob',
      loading_text: '正在读取数据...',
    }

    this.refreshFlag = {
      refreshAccount: 0,
      refreshOffer: 0,
      refreshGame: 0,
    }

    this.state = {
      diceStatus: false,
      loading: false,
      player1Status: 0,
      player2Status: 0,
      msgText: '[系统] - 游戏启动... ...',
    }
  }

  componentDidMount() {
    this._initLoadData()
  }

  _initLoadData() {
    console.log('_initLoadData::......')

    //this._eosjsAPITester()

    //this._eosjsCallPing()
    //this._getTableTicTacToe()

    this._readGameData()

    console.log('_initLoadData::更新UI显示......')
  }

  _eosjsAPITester(){
    console.log('_eosjsAPITester::......')
    let eos = EOS.Localnet(EOS_CONFIG.clientConfig)

    eos.contract(contract_name)
      .then((contract) => {
        console.log('_eosjsAPITester::' + contract_name + '合约加载成功！')

        // get_code 调用成功
        if(0){
          eos.getCode({"account_name":"alice"})
            .then(result => {
              console.log('_eosjsAPITester::Call API 成功！' + result)
          	})
           .catch((err) => {
             console.log('_eosjsAPITester::Call API 失败！')
           })
        }

        // get_table_rows 调用成功
        if(1){
          eos.getTableRows({"scope":contract_name, "code":contract_name, "table":"game", "json": true})
            .then(result => {
              console.log('_eosjsAPITester::getTableRows 成功！' + result)

              let rows = result.rows;
              let len = rows.length;
              if(len <= 0)  console.log('_eosjsAPITester::没有数据！')
              for(let i = 0; i < len; i ++){
              	console.log('_eosjsAPITester::rows[' + i + '].id:' + result.rows[i].id)
              	console.log('_eosjsAPITester::rows[' + i + '].bet:' + result.rows[i].bet)
              	console.log('_eosjsAPITester::rows[' + i + '].deadline:' + result.rows[i].deadline)
              	console.log('_eosjsAPITester::rows[' + i + '].player1.commitment:' + result.rows[i].player1.commitment)
              	console.log('_eosjsAPITester::rows[' + i + '].player1.reveal:' + result.rows[i].player1.reveal)
              	console.log('_eosjsAPITester::rows[' + i + '].player2.commitment:' + result.rows[i].player2.commitment)
              	console.log('_eosjsAPITester::rows[' + i + '].player2.reveal:' + result.rows[i].player2.reveal)
              }
          	})
           .catch((err) => {
             console.log('_eosjsAPITester::getTableRows 失败！')
           })
        }

      })
  }

  _refreshUIView() {
    console.log('_refreshUIView::state1=' + this.gamestate.player1_state + ', state2=' + this.gamestate.player2_state)
    // console.log('_refreshUIView::state1=' + this.gamestate.player1_state)
    // console.log('_refreshUIView::state2=' + this.gamestate.player2_state)
    // console.log('_refreshUIView::refreshAccount=' + this.refreshFlag.refreshAccount)
    // console.log('_refreshUIView::refreshOffer=' + this.refreshFlag.refreshOffer)
    // console.log('_refreshUIView::refreshGame=' + this.refreshFlag.refreshGame)

    if(this.refreshFlag.refreshAccount == 1 && this.refreshFlag.refreshOffer == 1 && this.refreshFlag.refreshGame == 1){

      this._addMsgText('刷新界面数据显示...')

      this.setState({
        player1Status: this.gamestate.player1_state,
        player2Status: this.gamestate.player2_state,
      })

      //setTimeout(this._showLoading, 1000 )
      this._showLoading(false, '')
    }
  }

  _showLoading(show, text){
    this.gamestate.loading_text = text
    this.setState({
      loading: show,
    })
  }

  _readGameDataDelay() {
    console.log('_readGameDataDelay::......')
    setTimeout(this._readGameData, 1500 )
  }

  _readGameData() {
    console.log('_readGameData::......')

    this.refreshFlag = {
      refreshAccount: 0,
      refreshOffer: 0,
      refreshGame: 0,
    }

    this._showLoading(true, '正在读取游戏数据... ...')
    this._addMsgText('正在读取游戏数据... ...')

    this._getTableDiceExAccount()
    this._getTableDiceExOffer()
    this._getTableDiceExGame()


  }

  // cleos get table dice dice account
  // cleos get table diceex diceex account
  _getTableDiceExAccount() {
    console.log('_getTableDiceExAccount::......')
    let eos = EOS.Localnet(EOS_CONFIG.clientConfig)

    eos.contract(contract_name)
      .then((contract) => {
        console.log('_getTableDiceExAccount::' + contract_name + '合约加载成功！')

        eos.getTableRows({"scope":contract_name, "code":contract_name, "table":"account", "json": true})
          .then(result => {
            console.log('_getTableDiceExAccount::getTableRows 成功！' + result)

            let rows = result.rows;
            let len = rows.length;
            if(len <= 0)  console.log('_getTableDiceExAccount::账户表没有数据！')
            for(let i = 0; i < len; i ++){
              var player_name = result.rows[i].owner
              var player_balance = result.rows[i].eos_balance
              var player_offer = result.rows[i].open_offers
              var player_gameid = result.rows[i].open_games

            	console.log('_getTableDiceExAccount::rows[' + i + '].owner:' + player_name)
            	console.log('_getTableDiceExAccount::rows[' + i + '].eos_balance:' + player_balance)
            	console.log('_getTableDiceExAccount::rows[' + i + '].open_offers:' + player_offer)
            	console.log('_getTableDiceExAccount::rows[' + i + '].open_games:' + player_gameid)

              if(player_name == this.gamestate.player1_name){
                this.gamestate.player1_state = 1
                this.gamestate.player1_balance = parseInt(player_balance)
              }else if(player_name == this.gamestate.player2_name){
                this.gamestate.player2_state = 1
                this.gamestate.player2_balance = parseInt(player_balance)
              }
            }
            this.refreshFlag.refreshAccount = 1
            this._refreshUIView()
        	})
         .catch((err) => {
           console.log('_getTableDiceExAccount::getTableRows 失败！')
           this.refreshFlag.refreshAccount = 1
         })
      })
  }

  // cleos get table dice dice offer
  // cleos get table diceex diceex offer
  _getTableDiceExOffer() {
    console.log('_getTableDiceExOffer::......')
    let eos = EOS.Localnet(EOS_CONFIG.clientConfig)

    eos.contract(contract_name)
      .then((contract) => {
        console.log('_getTableDiceExOffer::' + contract_name + '合约加载成功！')

        eos.getTableRows({"scope":contract_name, "code":contract_name, "table":"offer", "json": true})
          .then(result => {
            console.log('_getTableDiceExOffer::getTableRows 成功！' + result)

            let rows = result.rows;
            let len = rows.length;
            if(len <= 0)  console.log('_getTableDiceExOffer::下注表没有数据！')
            for(let i = 0; i < len; i ++){
              var offer_id = result.rows[i].id
              var offer_owner = result.rows[i].owner
              var offer_bet = result.rows[i].bet
              var offer_commitment = result.rows[i].commitment
              var offer_gameid = result.rows[i].gameid

            	console.log('_getTableDiceExOffer::rows[' + i + '].id:' + offer_id)
            	console.log('_getTableDiceExOffer::rows[' + i + '].owner:' + offer_owner)
            	console.log('_getTableDiceExOffer::rows[' + i + '].bet:' + offer_bet)
            	console.log('_getTableDiceExOffer::rows[' + i + '].commitment:' + offer_commitment)
            	console.log('_getTableDiceExOffer::rows[' + i + '].gameid:' + offer_gameid)

              if(offer_owner == this.gamestate.player1_name){
                this.gamestate.player1_state = 2
              }else if(offer_owner == this.gamestate.player2_name){
                this.gamestate.player2_state = 2
              }
              this.gamestate.gamestate = 1
            }
            this.refreshFlag.refreshOffer = 1
            this._refreshUIView()
        	})
         .catch((err) => {
           console.log('_getTableDiceExOffer::getTableRows 失败！')
           this.refreshFlag.refreshOffer = 1
         })
      })
  }

  // cleos get table dice dice game
  // cleos get table diceex diceex game
  _getTableDiceExGame() {
    console.log('_getTableDiceExGame::......')
    let eos = EOS.Localnet(EOS_CONFIG.clientConfig)

    eos.contract(contract_name)
      .then((contract) => {
        console.log('_getTableDiceExGame::' + contract_name + '合约加载成功！')

        eos.getTableRows({"scope":contract_name, "code":contract_name, "table":"game", "json": true})
          .then(result => {
            console.log('_getTableDiceExGame::getTableRows 成功！' + result)

            let rows = result.rows;
            let len = rows.length;
            for(let i = 0; i < len; i ++){
              var id = result.rows[i].id
              var bet = result.rows[i].bet
              var deadline = result.rows[i].deadline
              var player1_commitment = result.rows[i].player1.commitment
              var player1_reveal = result.rows[i].player1.reveal
              var player2_commitment = result.rows[i].player2.commitment
              var player2_reveal = result.rows[i].player2.reveal

            	console.log('_getTableDiceExGame::rows[' + i + '].id:' + id)
            	console.log('_getTableDiceExGame::rows[' + i + '].bet:' + bet)
            	console.log('_getTableDiceExGame::rows[' + i + '].deadline:' + deadline)
              console.log('_getTableDiceExGame::rows[' + i + '].player1.commitment:' + player1_commitment)
              console.log('_getTableDiceExGame::rows[' + i + '].player1.reveal:' + player1_reveal)
              console.log('_getTableDiceExGame::rows[' + i + '].player2.commitment:' + player2_commitment)
              console.log('_getTableDiceExGame::rows[' + i + '].player2.reveal:' + player2_reveal)

              if(i == len - 1){
                // 取最新一个游戏（其实应该用玩家的游戏id来判断）
                if(player1_reveal.indexOf("0000000000") < 0){
                  this.gamestate.player1_state = 3
                }
                if(player2_reveal.indexOf("0000000000") < 0){
                  this.gamestate.player2_state = 3
                }
              }
            }
            if(len <= 0){
              console.log('_getTableDiceExGame::游戏表没有数据！')

              // 没有游戏数据，可能是游戏已经结束了可以从余额进行判断游戏结果
              if(this.state.player1Status >= 2 && this.state.player2Status >= 2){
                if(this.gamestate.player1_balance < this.gamestate.player2_balance){
                  console.log('_getTableDiceExGame::bob胜出！')
                  this.gamestate.winner = 2
                }else{
                  console.log('_getTableDiceExGame::alice胜出！')
                  this.gamestate.winner = 1
                }
                this.gamestate.gamestate = 0
              }
            }
            this.refreshFlag.refreshGame = 1
            this._refreshUIView()
        	})
         .catch((err) => {
           console.log('_getTableDiceExGame::getTableRows 失败！')
           this.refreshFlag.refreshGame = 1
         })
      })
  }

  _getTableTicTacToe() {
    console.log('_getTableTicTacToe::......')
    let eos = EOS.Localnet(EOS_CONFIG.clientConfig)

    eos.contract("tic.tac.toe")
      .then((contract) => {
        console.log('_getTableTicTacToe::tic.tac.toe合约加载成功！')

        eos.getTableRows({"scope":"initb", "code":"tic.tac.toe", "table":"games", "json": true})
          .then(result => {
            console.log('_getTableTicTacToe::getTableRows成功！' + result)

            let rows = result.rows;
            for(let i = 0; i < rows.length; i ++){
            	console.log('_getTableTicTacToe::rows[' + i + '].board:' + result.rows[i].board)
            	console.log('_getTableTicTacToe::rows[' + i + '].challenger:' + result.rows[i].challenger)
            	console.log('_getTableTicTacToe::rows[' + i + '].host:' + result.rows[i].host)
            	console.log('_getTableTicTacToe::rows[' + i + '].turn:' + result.rows[i].turn)
            	console.log('_getTableTicTacToe::rows[' + i + '].winner:' + result.rows[i].winner)
            }
        	})
         .catch((err) => {
           console.log('_getTableTicTacToe::getTableRows 失败！')
         })
      })
  }

  // 调用ping合约的ping方法
  _eosjsCallPing() {
    console.log('_eosjsCallPing::......')
    let eos = EOS.Localnet(EOS_CONFIG.clientConfig)
    eos.contract(EOS_CONFIG.contractName)
      .then((contract) => {
        console.log('_eosjsCallPing::ping合约加载成功！')
        contract.ping(EOS_CONFIG.contractSender, { authorization: [EOS_CONFIG.contractSender] })
          .then((res) => {
             console.log('_eosjsCallPing::ping 成功！')
           })
          .catch((err) => {
            console.log('_eosjsCallPing::ping 失败！')
          })
      })
  }

  _actionExecute(play_id) {
    console.log('_actionExecute::play_id=' + play_id)

    //this.setState({ diceStatus: 'loading' })
    if(play_id == 1){
      if(this.state.player1Status == 0){
        // 去充值
        this._playerDeposit(play_id)
      }else if(this.state.player1Status == 1){
        // 去下注
        this._playerOfferbet(play_id)
      }else if(this.state.player1Status == 2){
        // 去开牌
        this._playerReveal(play_id)
      }
    }else if(play_id == 2){
      if(this.state.player2Status == 0){
        // 去充值
        this._playerDeposit(play_id)
      }else if(this.state.player2Status == 1){
        // 去下注
        this._playerOfferbet(play_id)
      }else if(this.state.player2Status == 2){
        // 去开牌
        this._playerReveal(play_id)
      }
    }
  }

  _playerDeposit(play_id) {
    this._showLoading(true, '正在充值... ...')

    console.log('_playerDeposit::玩家充值！play_id=' + play_id)
    let msg = 'alice开始充值...'
    let sender = 'alice'
    if(play_id == 2){
      sender = 'bob'
      msg = 'bob开始充值...'
    }
    this._addMsgText(msg)

    let eosClient = EOS.Localnet(EOS_CONFIG.clientConfig)

    eosClient.contract(EOS_CONFIG.contractName)
      .then((contract) => {
        console.log('_playerDeposit::合约载入成功！play_id=' + play_id)

        contract.deposit(sender, '100 EOS', { authorization: [sender] })
          .then((res) => {
            console.log('_playerDeposit::玩家充值成功！play_id=' + play_id)
            this._readGameData()
          })
          .catch((err) => {
            console.log('_playerDeposit::玩家充值失败！play_id=' + play_id)
          })
      })
  }

  _playerOfferbet(play_id) {
    this._showLoading(true, '正在下注... ...')

    console.log('_playerOfferbet::玩家下注！play_id=' + play_id)
    let sender = 'alice'
    let commitment = 'd533f24d6f28ddcef3f066474f7b8355383e485681ba8e793e037f5cf36e4883'
    let msg = 'alice开始下注...'
    if(play_id == 2){
      sender = 'bob'
      commitment = '50ed53fcdaf27f88d51ea4e835b1055efe779bb87e6cfdff47d28c88ffb27129'
      let msg = 'bob开始下注...'
    }
    this._addMsgText(msg)

    let eosClient = EOS.Localnet(EOS_CONFIG.clientConfig)

    eosClient.contract(EOS_CONFIG.contractName)
      .then((contract) => {
        console.log('_playerOfferbet::合约载入成功！play_id=' + play_id)

        contract.offerbet('3 EOS', sender, commitment, { authorization: [sender] })
          .then((res) => {
            console.log('_playerOfferbet::玩家下注成功！play_id=' + play_id)
            this._readGameData()
          })
          .catch((err) => {
            console.log('_playerOfferbet::玩家下注失败！play_id=' + play_id)
          })
      })

  }

  _playerReveal(play_id) {
    this._showLoading(true, '正在开牌... ...')

    console.log('_playerReveal::玩家开牌！play_id=' + play_id)
    let sender = 'alice'
    let commitment = 'd533f24d6f28ddcef3f066474f7b8355383e485681ba8e793e037f5cf36e4883'
    let source = '28349b1d4bcdc9905e4ef9719019e55743c84efa0c5e9a0b077f0b54fcd84905'
    let msg = 'alice开始开牌...'
    if(play_id == 2){
      sender = 'bob'
      commitment = '50ed53fcdaf27f88d51ea4e835b1055efe779bb87e6cfdff47d28c88ffb27129'
      source = '15fe76d25e124b08feb835f12e00a879bd15666a33786e64b655891fba7d6c12'
      msg = 'bob开始开牌...'
    }
    this._addMsgText(msg)

    let eosClient = EOS.Localnet(EOS_CONFIG.clientConfig)

    eosClient.contract(EOS_CONFIG.contractName)
      .then((contract) => {
        console.log('_playerReveal::合约载入成功！play_id=' + play_id)

        contract.reveal(commitment, source, { authorization: [sender] })
          .then((res) => {
            console.log('_playerReveal::玩家开牌成功！play_id=' + play_id)
            this._readGameData()
          })
          .catch((err) => {
            console.log('_playerReveal::玩家开牌失败！play_id=' + play_id)
          })
      })

  }

  render() {
    console.log('render::...')
    return (this._renderMain())
  }

  _renderMain() {
    return (
      <div style={ style.container }>
        {this._renderHeader()}
        {this._renderBody()}
        {this._renderLoading()}
      </div>
    )
  }

  _renderLoading() {

    if(this.state.loading){
      //console.log('_renderLoading::true...')
      return (
        <div style={ style.loadingBox }>
          <div style={ style.loadingImage }>
            <img style={ style.loadingImageImg } src="images/prompticon.png" width='100' height='100'></img>
          </div>
          <div style={ style.loadingText }>
            <span style={ style.loadingTextValue }>{this.gamestate.loading_text}</span>
          </div>
        </div>
      )
    }else{
      //console.log('_renderLoading::false...')
      return null;
    }
  }

  _renderHeader() {
    //console.log('_renderHeader::...')
    return (
      <div style={ style.headerBox }>
        <div style={ style.headerLogoBox }>
          <img style={ style.headerLogo } src="images/logo-s.png" width='180' height='200'></img>
        </div>
      </div>
    )
  }

  _renderBody() {
    //console.log('_renderBody::...')
    return (
      <div style={ style.bodyBox }>
        {this._renderGameBox()}
        {this._renderChatBox()}
      </div>
    )
  }

  _renderGameBox() {
    //console.log('_renderGameBox::...')
    return (
      <div style={ style.gameBox }>
        {this._renderGameBoxPlayer(1)}
        {this._renderGameBoxScreen()}
        {this._renderGameBoxPlayer(2)}
      </div>
    )
  }

  _renderGameBoxPlayer(play_id) {
    //console.log('_renderGameBoxPlayer::play_id:' + play_id)
    var play_name = 'Alice'
    var play_img = 'images/alice_img.jpg'
    if(play_id == 2){
      play_name = 'Bob'
      play_img = 'images/bob_img.jpg'
    }
    return (
      <div style={ style.gameBoxPlayer }>
        {this._renderPlayerName(play_name)}
        {this._renderPlayerImage(play_img)}
        {this._renderPlayerButton(play_id)}
      </div>
    )
  }

  _renderPlayerName(play_name) {
    //console.log('_renderPlayerName::play_name:' + play_name)
    return (
      <div style={ style.gamePlayerName }>
        <span style={ style.gamePlayerNameValue }>{play_name}</span>
      </div>
    )
  }

  _renderPlayerImage(play_img) {
    //console.log('_renderPlayerImage::play_img:' + play_img)
    return (
      <div style={ style.gamePlayerImage }>
        <img style={ style.gamePlayerImageValue } src={play_img}></img>
      </div>
    )
  }

  _renderPlayerButton(play_id) {
    //console.log('_renderPlayerButton::play_id:' + play_id)
    var btnTitle = '未知状态'
    var playerState = 0
    if(play_id == 1){
      playerState = this.state.player1Status
    }else if(play_id == 2){
      playerState = this.state.player2Status
    }
    if(playerState == 0){
      btnTitle = '充值'
    }else if(playerState == 1){
      btnTitle = '下注'
    }else if(playerState == 2){
      btnTitle = '开牌'
    }else if(playerState == 3){
      btnTitle = '已经开牌'
    }

    return (
      <div style={ style.gamePlayerButton }>
        <button style={ style.playButton } onClick={this._clickPlayerBtn.bind(this, play_id)}>{btnTitle}</button>
      </div>
    )
  }

  _renderGameBoxScreen() {
    //console.log('_renderGameBoxScreen::...')
    var stateText = '游戏等待开局'
    if(this.gamestate.winner == 1){
      stateText = 'alice胜出！'
    }else if(this.gamestate.winner == 2){
      stateText = 'bob胜出！'
    }else if(this.state.player1Status == 0 || this.state.player2Status == 0){
      stateText = '需要充值！'
    }else if(this.state.player1Status == 1 || this.state.player2Status == 1){
      stateText = '可以下注了！'
    }else if(this.state.player1Status == 2 || this.state.player2Status == 2){
      stateText = '可以开牌了！'
    }

    return (
      <div style={ style.gameBoxScreen }>
        {this._renderGameScreenStatus(stateText)}
        {this._renderGameScreenFrames()}
        {this._renderGameScreenRefresh()}
      </div>
    )
  }

  _renderGameScreenStatus(stateText) {
    //console.log('_renderGameScreenStatus::stateText=' + stateText)
    return (
      <div style={ style.gameScreenStatus }>
        <span style={ style.gameScreenStatusValue }>{stateText}</span>
      </div>
    )
  }

  _renderGameScreenFrames() {
    //console.log('_renderGameScreenFrames::...')
    var frames_img = 'images/presenter.png'
    return (
      <div style={ style.gameScreenFrames }>
        <img style={ style.gameScreenFramesValue } src={frames_img}></img>
      </div>
    )
  }

  _renderGameScreenRefresh() {
    //console.log('_renderGameScreenRefresh::...')
    return (
      <div style={ style.gameScreenRefresh }>
        <button style={ style.playButton } onClick={this._clickRefreshBtn.bind(this)}>刷新游戏</button>
      </div>
    )
  }

  _renderChatBox() {
    //console.log('_renderChatBox::...')
    return (
      <div style={ style.chatBox }>
        {this._renderChatMsgText()}
      </div>
    )
  }

  _renderChatMsgText() {
    //console.log('_renderChatMsgText::...')
    return (
      <div style={ style.chatBoxMsgText }>
        <div style={ style.chatBoxMsgTextValue }  dangerouslySetInnerHTML={{__html: this.state.msgText}}></div>
      </div>
    )
  }

  _addMsgText(text) {
    var msgText = this.state.msgText
    this.setState({
      msgText: msgText + '<br>[系统] - ' + text
    })
  }

  _clickPlayerBtn(play_id) {
    console.log('_clickPlayerBtn::play_id=' + play_id)
    this._actionExecute(play_id)
  }

  _clickRefreshBtn() {
    console.log('_clickRefreshBtn::... ...')
    this._readGameData()
  }

}

const style = {
  container: {
    width: '100%',
    height: 1000,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundImage: 'url(images/bg.jpg)',
  },
  loadingBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.85,
    backgroundColor: '#000000',
  },
  loadingImage: {
    position: 'relative',
    width: '100%',
    height: 120,
    lineHeight: 120,
    alignItems: 'center',
    marginTop: 220,
    marginBottom: 30,
  },
  loadingImageImg: {
    position: 'absolute',
    left: '45%',
    width: 100,
    height: 100,
  },
  loadingText: {
    position: 'relative',
    width: '100%',
    height: 120,
    lineHeight: 120,
  },
  loadingTextValue: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '99%',
    height: 100,
    lineHeight: 2,
    color: '#ffffff',
    fontSize: 28,
    paddingTop: '-50',
    textAlign: 'center',
  },
  headerBox: {
    width: '100%',
    height: 180,
    padding: 5,
  },
  headerLogoBox: {
    height: 180,
  },
  headerLogo: {
    width: 720,
    height: 160,
    marginTop: 10,
    marginLeft: 10,
  },
  bodyBox: {
    width: '100%',
    height: 'auto',
    paddingBottom: 25,
    marginBottom: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameBox: {
    width: '100%',
    height: 400,
    marginBottom: 35,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1.0,
  },
  gameBoxPlayer: {
    display: 'inline-block',
    width: 200,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 35,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
    backgroundColor: '#d3e39f',
  },
  gamePlayerName: {
    width: '100%',
    height: 50,
    marginBottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamePlayerNameValue: {
    display: 'block',
    width: '100%',
    height: 36,
    paddingTop: 5,
    textAlign: 'center',
    color: '#ff3300',
    fontSize: 25,
  },
  gamePlayerImage: {
    width: 180,
    height: 200,
    marginLeft: 10,
    marginBottom: 0,
  },
  gamePlayerImageValue: {
    width: 180,
    height: 200,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
  },
  gamePlayerButton: {
    width: '100%',
    height: 50,
    marginTop: 5,
  },
  playButton: {
    width: 160,
    height: 40,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
    marginLeft: 20,
    marginTop: 5,
    color: '#ffffff',
    fontSize: 20,
    outline: 'none',
    backgroundColor: '#ff3300',
  },
  gameBoxScreen: {
    display: 'inline-block',
    width: 220,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 35,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
    backgroundColor: '#81c1ec',
  },
  gameScreenStatus: {
    width: 200,
    height: 80,
  },
  gameScreenStatusValue: {
    display: 'block',
    width: '100%',
    height: 36,
    paddingTop: 20,
    marginTop: 20,
    marginLeft: 10,
    textAlign: 'center',
    color: '#ff3300',
    fontSize: 28,
  },
  gameScreenFrames: {
    width: 200,
    height: 200,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 0,
	  borderRadius: 3,
    marginLeft: 10,
  },
  gameScreenFramesValue: {
    width: 120,
    height: 180,
    marginTop: 10,
    marginLeft: 40,
  },
  gameScreenRefresh: {
    width: 220,
    height: 80,
    textAlign: 'center',
  },
  chatBox: {
    width: '100%',
    height: 300,
    marginBottom: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatBoxMsgText: {
    width: '95%',
    minHeight: 280,
    paddingTop: 10,
    paddingLeft: 10,
    marginLeft: 10,
  	borderColor: '#cdc9c9',
  	borderStyle: 'solid',
  	borderWidth: 1,
	  borderRadius: 3,
    backgroundColor: '#e7e7e7',
  },
  chatBoxMsgTextValue: {
    display: 'block'
  }

}

ReactDOM.render(<Dicedemo />, document.getElementById('app'));

module.hot.accept();

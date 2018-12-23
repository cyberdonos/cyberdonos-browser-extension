class CyberdonosBackgroundJS {
  constructor() {
    this.HOSTNAME = this.getServer()
    this.TAGS = null
    this.SERVER_UNREACHABLE = "server-unreachable"
    console.log(`Выбран сервер: ${this.HOSTNAME}`)
    this.HEADERS = {
      headers: {
        "token": null
      }
    }
    this.STATUSES = [
      {id: 0, name: "новый", file: "not-verified" },
      {id: 1, name: "проверено", file: "verified-by-admin"},
      {id: 2, name: "проверено внешним аудитом", file: "3rdparty" }
    ]
    this.ROLES = {
      "1": "суперадмин",
      "2": "админ",
      "3": "Пользователь",
      "4": "reserved"
    }
    this.LISTS = {
      twitter: {
        L_BUTTERS_STOTCH: [],
        POROHOBOTY_PIDORY: []
      },
      youtube: {},
      vk: {}
     }

     this.ANTIBOT4NAVALNY_LIST_URL = `https://blocktogether.org/show-blocks/SiJai3FyVmodO0XxkL2r-pezIK_oahHRwqv9I6U3.csv`
     this.ANTIBOT4NAVALNY_LIST_BACKUP_URL = browser.extension.getURL("assets/antibot4navalny.txt")
     this.YTOBSERVER_MAINDB_URL = `https://raw.githubusercontent.com/YTObserver/YT-ACC-DB/master/mainDB`
     this.YTOBSERVER_MAINDB_BACKUP_URL = browser.extension.getURL("assets/YTObserver-mainDB.txt")
     this.YTOBSERVER_SMM_ALL_URL = `https://raw.githubusercontent.com/YTObserver/YT-ACC-DB/master/smm_all.txt`
     this.YTOBSERVER_SMM_ALL_BACKUP_URL = browser.extension.getURL("assets/YTObserver_smm_all.txt")
     this.KARATEL_GET_BY_ID_URL = `https://karatel.foss.org.ua/lib64/libcheck.so?tw_id=`
  }

  getServer() {
    const serverNames = [
      "https://node1.cyberdonos.xyz",
      "https://node2.cyberdonos.xyz",
      "https://node3.cyberdonos.xyz",
      "https://node4.cyberdonos.xyz",
      "https://node5.cyberdonos.xyz"
    ]
    return serverNames[Math.floor(Math.random() * (serverNames.length) - 0)]
  }

  loadTwitterLists() {
    return fetch(browser.extension.getURL("assets/L_Butters_Stotch_List.json"))
           .then(LButtersStotchRaw => LButtersStotchRaw.json())
           .then(LButtersStotchData =>  {
             this.LISTS.twitter.L_BUTTERS_STOTCH = LButtersStotchData
             return fetch(browser.extension.getURL("assets/PorohoBoty_pidory_list.json"))
           })
           .then(PorohoBotyRaw => PorohoBotyRaw.json())
           .then(PorohoBotyData => {
             this.LISTS.twitter.POROHOBOTY_PIDORY = PorohoBotyData
             return Promise.all([
               fetch(this.ANTIBOT4NAVALNY_LIST_URL),
               fetch(this.ANTIBOT4NAVALNY_LIST_BACKUP_URL)
             ])
           })
           .then(antibot4navalnyRawData => {
             const rawDataAntibot4navalny = antibot4navalnyRawData[0].status === 200 ? antibot4navalnyRawData[0] : antibot4navalnyRawData[1]
             return rawDataAntibot4navalny.text()
           })
           .then(antibot4navalny => this.LISTS.twitter.ANTIBOT4NAVALNY = antibot4navalny.split("\n"))
           .catch(e => console.error(e))
  }

  loadYoutubeLists() {
    return Promise.all([
             fetch(this.YTOBSERVER_MAINDB_URL),
             fetch(this.YTOBSERVER_MAINDB_BACKUP_URL),
             fetch(this.YTOBSERVER_SMM_ALL_URL),
             fetch(this.YTOBSERVER_SMM_ALL_BACKUP_URL)
           ])
           .then(ytresultsRaw => {
             const mainDBRaw = ytresultsRaw[0].status === 200 ? ytresultsRaw[0] : ytresultsRaw[1]
             const SMMALLRaw = ytresultsRaw[2].status === 200 ? ytresultsRaw[2] : ytresultsRaw[3]
             return Promise.all([mainDBRaw.text(), SMMALLRaw.text()])
           })
           .then(ytObserverData => {
             const _ytobserverArrayMain = ytObserverData[0].split("\r\n").map(e => e.split("="))
             const _ytobserverArraySmm = ytObserverData[1].split("\r\n").map(e => e.split("="))
             this.LISTS.youtube.YTOBSERVER_MAINDB = {}
             this.LISTS.youtube.YTOBSERVER_SMM = {}
             _ytobserverArrayMain.forEach(e => this.LISTS.youtube.YTOBSERVER_MAINDB[e[0]] = e[1])
             _ytobserverArraySmm.forEach(e => this.LISTS.youtube.YTOBSERVER_SMM[e[0]] = e[1])
           })
           .catch(e => console.error(e))
  }

  registerInsider() {
    return fetch(`${this.HOSTNAME}/api/v1/insiders/register`, { method: "POST" })
           .then((response) => response.json())
           .then((result) => {
             console.log(`ответ о регистрации ${JSON.stringify(result)}`)
             if (result.data.token && result.data.role) {
               localStorage.setItem("token", result.data.token)
               localStorage.setItem("role", result.data.role)
               this.HEADERS.headers.token = result.data
             }
             else {
               console.error(`Токен не получен`)
             }
           })
           .catch(e => {
             browser.notifications.create("failed-to-start", {
               "type": "basic",
               "title": `Кибердонос: ${e.message} ошибка при старте.`,
               "message": `${e}`
             })
           })
  }

  getCreatedDateAndLastModified(vkId) {
    //console.log(`Получение данных о регистрации и логине для ${vkId}`)
    return new Promise((resolve, reject) => {
      return fetch(`https://vk.com/foaf.php?id=${vkId}`)
      .then((response) => response.text())
      .then((str) => {
        // это группа - игнорируем ее
        if (vkId.startsWith("-")) {
          resolve({ registerDate: null, lastLoggedIn: null })
        }
        else {
          try {
            const xml = new window.DOMParser().parseFromString(str, "text/xml")
            const registerDate = dayjs(xml.getElementsByTagName("ya:created")[0].getAttribute("dc:date")).format("DD.MM.YY") || "null"
            const lastLoginDate = dayjs(xml.getElementsByTagName("ya:lastLoggedIn")[0].getAttribute("dc:date")).format("DD.MM.YY") || "null"
            resolve({ registerDate: registerDate, lastLoggedIn: lastLoginDate })
          } catch (e) {
            console.error(e)
            resolve({ registerDate: e, lastLoggedIn: e })
          }
        }
      })
    })
  }

  getTags() {
    return fetch(`${this.HOSTNAME}/api/v1/tags`, this.HEADERS)
           .then((response) => response.json())
           .then((data) => this.TAGS = data.data)
           .catch(e => console.error(`Ошибка при получении тегов. ${e}`))
  }

  getPersonByVkId (vkId) {
    return fetch(`${this.HOSTNAME}/api/v1/persons/get/vk/${vkId}`, this.HEADERS)
           .then((response) => response.json())
  }

  getByTwitterId(userId) {
    let result = { }
    return fetch(`${this.HOSTNAME}/api/v1/persons/get/twitter/${userId}`, this.HEADERS)
          .then(response => response.json())
          .then(_result => {
            result = _result
            return fetch(this.KARATEL_GET_BY_ID_URL + userId)
          })
          .then(_response => _response.text())
          .then(__result => {
            const lowerCasedResult = __result.toLowerCase()
            const parsed = JSON.parse(lowerCasedResult)
            if (parsed && parsed.banned && parsed.banned === true) {
              if (!result.data) {
                result.data = { }
              }
              result.data.IsInKaratelDb = true
            }
            if (this.LISTS.twitter.L_BUTTERS_STOTCH.indexOf(userId) !== -1) {
              if (!result.data) {
                result.data = { }
              }
              result.data.IsInLButterStotchList = true
            }
            if (this.LISTS.twitter.POROHOBOTY_PIDORY.indexOf(userId) !== -1) {
              if (!result.data) {
                result.data = { }
              }
              result.data.IsInPorohoBotyPidoryList = true
            }
            if (this.LISTS.twitter.ANTIBOT4NAVALNY.indexOf(userId) !== -1) {
              if (!result.data) {
                result.data = { }
              }
              result.data.IsInAntibot4navalnyList = true
            }
            return result
          })
          .catch(e => console.error(e))
  }

  getByYTUser(id) {
    let result = { }
    return fetch(`${this.HOSTNAME}/api/v1/persons/get/youtube/${id}`, this.HEADERS)
           .then(response => response.json())
           .then(_result => {
             console.log(_result)
             result = _result
             if (this.LISTS.youtube.YTOBSERVER_MAINDB[id]) {
               if (!result.data) {
                 result.data = { }
                 result.data.youtube_id = id
               }
               result.data.IsInYTOBSERVER_MANDBList = true
               result.data.proof = result.data.proof ? result.data.proof + "; " + this.LISTS.youtube.YTOBSERVER_MAINDB[id] : this.LISTS.youtube.YTOBSERVER_MAINDB[id]
             }
             if (this.LISTS.youtube.YTOBSERVER_SMM[id]) {
               if (!result.data) {
                 result.data = { }
                 result.data.youtube_id = id
               }
               result.data.IsInYTOBSERVERSMMList = true
               result.data.proof = result.data.proof ? result.data.proof + "; " + this.LISTS.youtube.YTOBSERVER_SMM[id] : this.LISTS.youtube.YTOBSERVER_SMM[id]
             }
             console.log(result)
             return result
           })
           .catch(e => console.error(e))
  }


  start() {
    this.loadTwitterLists()//.then(() => console.log(this.LISTS))
    this.loadYoutubeLists().then(() => console.log(this.LISTS))
    fetch(`${this.HOSTNAME}/api/v1/status/get`)
    .then(() => {
      if (localStorage.getItem("token") && localStorage.getItem("role")) {
        console.log(`Токен ${localStorage.getItem("token")} и роль уже установлены ${localStorage.getItem("role")}`)
        this.HEADERS.headers.token = localStorage.getItem("token")
        this.getTags()
        .then(() => this.startListener())
      }
      else {
        console.log('Попытка регистрации...')
        this.registerInsider()
        .then(() => {
          console.log("Успешная регистрация!")
          console.log(`Данные в localStorage: token - ${localStorage.getItem("token")}, role ${localStorage.getItem("role")}`)
          this.HEADERS.headers.token = localStorage.getItem("token")
          this.getTags()
          .then(() => this.startListener())
        })
        .catch(e => console.error("Ошибка во время регистрации", e))
      }
    })
    .catch(e => {
      browser.notifications.create(this.SERVER_UNREACHABLE, {
        "type": "basic",
        "title": `Кибердонос: ${this.HOSTNAME} недоступен.`,
        "message": `Попробуйте использовать прокси, vpn или tor. \n ERROR: ${e}`
      })
    })
  }

  startListener() {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(request)
      if (request.action === 'getSystemData') {
        sendResponse({ tags: this.TAGS, server: this.HOSTNAME, statuses: this.STATUSES })
      }
      else if (request.action === "getAccountData") {
        sendResponse({
          role_id: localStorage.getItem("role") || null,
          role_name: this.ROLES[localStorage.getItem("role")],
          token: localStorage.getItem("token")
        })
      }
      else if (request.action === "getPersonByVkId" && request.data) {
        const r = {  }
        r[request.data] = { }
        return this.getPersonByVkId(request.data)
        .then((result) => {
          r[request.data] = { data: result.data, dates: null }
          //console.log(result.data)
          return new Promise((resolve, reject) => {
            return this.getCreatedDateAndLastModified(request.data)
            .then((dates) => {
              //console.log(dates)
              r[request.data].dates = dates
              resolve(r)
            })
            .catch(e => console.error(e))

          })
        })
        .catch(e => console.error(e))
      }
      else if (request.action === 'getYoutubeUser' && request.id) {
        // return fetch(`${this.HOSTNAME}/api/v1/persons/get/youtube/${request.id}`, this.HEADERS)
        //        .then((response) => response.json())
        //        .catch(e => console.error(e))
        console.log(1111111);
        return this.getByYTUser(request.id)
               .catch(e => console.error(e))
      }
      else if (request.action === 'searchOrgs' && request.org) {
        return fetch(`${this.HOSTNAME}/api/v1/orgs/search/${request.org}`, this.HEADERS)
               .then((response) => response.json())
               .catch(e => console.error(e))
      }
      else if (request.action === "addPerson" && request.data && request.type) {
        console.log("request data - ", request.data)
        return fetch(`${this.HOSTNAME}/api/v1/persons/${request.type}/add`,
                    {
                      headers: {
                        token: localStorage.getItem("token")
                      },
                      method: 'POST',
                      body: JSON.stringify(request.data)
                    }
                  )
                  .then(response => response.json())
                  .then(data => {
                    return new Promise((resolve, reject) => {
                      resolve(data)
                    })
                  })
                  .catch(e => console.error(`error when adding person: ${e}`))
      }
      else if (request.action === "editPerson") {

      }
      else if (request.action === 'setToken' && request.data) {
        console.log(`Запрос на установку токена ${request.data}`)
        return fetch(`${this.HOSTNAME}/api/v1/insiders/get_role_by_token/${request.data}`)
        .then(response => response.json())
        .then(data => {
          return new Promise((resolve, reject) => {
            console.log(`Получен ответ о запросе токена: ${JSON.stringify(data)}`)
            if (data.role) {
              this.HEADERS.headers.token = request.data
              localStorage.setItem("token", request.data)
              localStorage.setItem("role", data.role)
              resolve({ message: "Токен установлен! "})
            }
            else {
              resolve({ message: "Токен не установлен! "})
            }
          })
        })
        .catch(e => console.error(e))
      }
      else if (request.action === 'getAbuse' && request.data.vk_id) {
        console.log('getAbuse');
        return fetch(`${this.HOSTNAME}/api/v1/persons/get_abuse/${request.data.vk_id}`, this.HEADERS)
        .then(response => response.json())
        .then(data => {
          return new Promise((resolve, reject) => {
            console.log(data)
            resolve(data)
          })
        })
        .catch(e => console.error(e))
      }
      else if (request.action === "getByTwitterId" && parseInt(request.id)) {
        return this.getByTwitterId(request.id)
      }
      else if (request.action === "sendAbuse" && request.data) {
        return fetch(`${this.HOSTNAME}/api/v1/persons/abuse`, {
                headers: {
                  token: localStorage.getItem("token")
                },
                method: "POST",
                body: JSON.stringify({ vk_id: request.data.vk_id, text: request.data.text })
              })
              .then((response) => response.json())
              .then((data) => {
                return new Promise((resolve, reject) => {
                  console.log(data)
                  resolve(data)
                })
              })
              .catch(e => console.error(e))
      }
      else {
        console.log(`неверный action ${JSON.stringify(request)}`)
      }
    })
  }
}

const cdbjs = new CyberdonosBackgroundJS()
console.log('background.js запускается...')
cdbjs.start()

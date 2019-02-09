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

    this.CACHE = {
      "youtube": {},
      "vk": {},
      "twitter": {}
    }

   this.KARATEL_GET_BY_ID_URL = `https://karatel.foss.org.ua/lib64/libcheck.so?tw_id=`
   this.CONFIG = {
     updateInterval: 5000,
     lists: {
       lists: {
         youtube: {
           YTOBSERVER_MAINDB: {
             active: true,
             icon_url: browser.extension.getURL("assets/ytkremlebot.png"),
             text: "В списках Кремлеботов YTObserver/Metabot for youtube",
             type: "text",
             urls: [
               `https://raw.githubusercontent.com/YTObserver/YT-ACC-DB/master/mainDB`,
               browser.extension.getURL("assets/YTObserver-mainDB.txt")
             ]
           },
           YTOBSERVER_SMM: {
             active: true,
             icon_url: browser.extension.getURL("assets/ytsmm.png"),
             text: "С списках SMM ботов YTObserver/Metabot for youtube",
             type: "text",
             urls: [
               `https://raw.githubusercontent.com/YTObserver/YT-ACC-DB/master/smm_all.txt`,
               browser.extension.getURL("assets/YTObserver_smm_all.txt")
             ]
           },
           YTOBSERVER_POLITICAL_BOTS: {
             active: true,
             icon_url: browser.extension.getURL("assets/political.png"),
             text: "С списках политических ботов YTObserver/Metabot for youtube",
             type: "text",
             urls: [
               `https://raw.githubusercontent.com/YTObserver/YT-ACC-DB/master/political_bots.txt`,
               browser.extension.getURL("assets/YTObserver_political_bots.txt")
             ]
           },
           YTOBSERVER_SMM_BOTS: {
             active: true,
             icon_url: browser.extension.getURL("assets/smm_bot.png"),
             text: "С списках политических ботов YTObserver/Metabot for youtube",
             type: "text",
             urls: [
               `https://raw.githubusercontent.com/YTObserver/YT-ACC-DB/master/smm_bots.txt`,
               browser.extension.getURL("assets/YTObserver_smm_bots.txt")
             ]
           }
         },
         twitter: {
           POROHOBOTY_PIDORY: {
             active: true,
             icon_url: browser.extension.getURL("assets/ukrobot.png"),
             text: "В списках #ПОРОХОБОТЫПИДОРЫ",
             type: "json",
             urls: [ browser.extension.getURL("assets/PorohoBoty_pidory_list.json") ]
           },
           L_BUTTERS_STOTCH: {
             active: true,
             icon_url: browser.extension.getURL("assets/butters.png"),
             text: "В списке ботов/мракобесов Л.Баттерса Стотча",
             type: "json",
             urls: [ browser.extension.getURL("assets/L_Butters_Stotch_List.json") ]
           },
           ANTIBOT4NAVALNY: {
             active: true,
             icon_url: browser.extension.getURL("assets/antibot4navalny.png"),
             text: "В списках кремлеботов antibot4navalny",
             type: "text",
             urls: [
               `https://blocktogether.org/show-blocks/SiJai3FyVmodO0XxkL2r-pezIK_oahHRwqv9I6U3.csv`,
               browser.extension.getURL("assets/antibot4navalny.txt")
             ]
           },
           NASHACANADA: {
             active: true,
             icon_url: browser.extension.getURL("assets/nasha_canada_bots.png"),
             text: "В списках ботов, ваты и долбаебов @NashaCanada",
             type: "json",
             urls: [ browser.extension.getURL("assets/nasha_canada_bots.json") ]
           },
           KARATEL: {
             active: true,
             icon_url: browser.extension.getURL("assets/karatel.png"),
             text: "В списках Карателя",
             url: `https://karatel.foss.org.ua/lib64/libcheck.so?tw_id=`
           }
       },
       vk: {},
      },
      api: {
        youtube: {},
        twitter: {
          KARATEL: {
            active: true,
            icon_url: browser.extension.getURL("assets/karatel.png"),
            text: "В списках Карателя",
            url: `https://karatel.foss.org.ua/lib64/libcheck.so?tw_id=`
          }
        },
        vk: {}
      }
    }
  }

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
    const listPromises = []
    Object.keys(this.CONFIG.lists.lists.twitter).filter(e => e !== 'KARATEL').forEach(key => {
      this.CONFIG.lists.lists.twitter[key].urls.forEach(url => listPromises.push(fetch(url)))
    })
    return Promise.all(listPromises)
           .then(rawData => {
             return Promise.all([
               rawData[0].json(),
               rawData[1].json(),
               rawData[2].status === 200 ? rawData[2].text() : rawData[3].text(),
               rawData[4].json()
             ])
           })
           .then(results => {
             this.LISTS.twitter.POROHOBOTY_PIDORY = results[0]
             this.LISTS.twitter.L_BUTTERS_STOTCH = results[1]
             this.LISTS.twitter.ANTIBOT4NAVALNY = results[2].split("\n") || []
             this.LISTS.twitter.NASHACANADA = results[3]
           })
           .catch(e => console.error(e))
  }

  loadYoutubeLists() {
    const listPromises = []
    Object.keys(this.CONFIG.lists.lists.youtube).forEach(key => {
      this.CONFIG.lists.lists.youtube[key].urls.forEach(url => listPromises.push(fetch(url)))
    })
    return Promise.all(listPromises)
           .then(ytresultsRaw => {
             const mainDBRaw = ytresultsRaw[0].status === 200 ? ytresultsRaw[0] : ytresultsRaw[1]
             const SMMALLRaw = ytresultsRaw[2].status === 200 ? ytresultsRaw[2] : ytresultsRaw[3]
             const SMMPoliticalRaw = ytresultsRaw[4].status === 200 ? ytresultsRaw[4] : ytresultsRaw[5]
             const SMMBotsRaw = ytresultsRaw[6].status === 200 ? ytresultsRaw[6] : ytresultsRaw[7]
             return Promise.all([mainDBRaw.text(), SMMALLRaw.text(), SMMPoliticalRaw.text(), SMMBotsRaw.text()])
           })
           .then(ytObserverData => {
             const _ytobserverArrayMain = ytObserverData[0].split("\r\n").map(e => e.split("="))
             const _ytobserverArraySmm = ytObserverData[1].split("\r\n").map(e => e.split("="))
             const _ytobserverArrayPolitical = ytObserverData[2].split("\r\n").filter(e => !e.startsWith("//")).map(e => e.split("="))
             const _ytobserverArraySmmBots = ytObserverData[3].split("\r\n").filter(e => !e.startsWith("//")).map(e => e.split("="))
             this.LISTS.youtube.YTOBSERVER_MAINDB = []
             this.LISTS.youtube.YTOBSERVER_SMM = []
             this.LISTS.youtube.YTOBSERVER_POLITICAL_BOTS = []
             this.LISTS.youtube.YTOBSERVER_SMM_BOTS = []
             _ytobserverArrayMain.forEach(e => this.LISTS.youtube.YTOBSERVER_MAINDB.push(e[0]))
             _ytobserverArraySmm.forEach(e => this.LISTS.youtube.YTOBSERVER_SMM.push(e[0]))
             _ytobserverArrayPolitical.forEach(e => this.LISTS.youtube.YTOBSERVER_POLITICAL_BOTS.push(e[0]))
             _ytobserverArraySmmBots.forEach(e => this.LISTS.youtube.YTOBSERVER_SMM_BOTS.push(e[0]))
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

  createDefaultOrLoadConfig() {
    if (!localStorage.getItem("config")) {
      localStorage["config"] = JSON.stringify(this.CONFIG)
    }
    else {
      this.CONFIG = JSON.parse(localStorage["config"])
    }
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
            const registerDate = xml.getElementsByTagName("ya:created").length > 0 ? dayjs(xml.getElementsByTagName("ya:created")[0].getAttribute("dc:date")).format("DD.MM.YY") : "null"
            const lastLoginDate = xml.getElementsByTagName("ya:lastLoggedIn").length > 0 ? dayjs(xml.getElementsByTagName("ya:lastLoggedIn")[0].getAttribute("dc:date")).format("DD.MM.YY") : "null"
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

  getPersonByVkId(vkId, force = false) {
    if (this.CACHE["vk"][vkId] && !force) {
      return new Promise((resolve, reject) => resolve(this.CACHE["vk"][vkId]))
    }
    else {
      return fetch(`${this.HOSTNAME}/api/v1/persons/get/vk/${vkId}`, this.HEADERS)
             .then((response) => response.json())
             .then((data) => {
               this.CACHE["vk"][vkId] = data
               return new Promise((resolve, reject) => resolve(data))
             })
             .catch(e => console.error(e))
    }

  }

  processKaratelResponse(response) {
    const lowerCasedResult = response.toLowerCase()
    const parsed = JSON.parse(lowerCasedResult)
    let result = false
    if (parsed && parsed.banned && parsed.banned === true) {
      result = true
    }
    return result
  }

  getByTwitterId(userId, force = false) {
    if (this.CACHE["twitter"][userId] && !force) {
      // console.log('из кэша')
      return new Promise((resolve, reject) => resolve(this.CACHE["twitter"][userId]))
    }
    else {
      let result = { }
      return Promise.all([
               fetch(`${this.HOSTNAME}/api/v1/persons/get/twitter/${userId}`, this.HEADERS),
               fetch(this.KARATEL_GET_BY_ID_URL + userId)
             ])
             .then((rawResults) => {
               return Promise.all([
                 rawResults[0].json(),
                 rawResults[1].text()
               ])
             })
             .then((results) => {
               result = results[0]
               if (this.processKaratelResponse(results[1])) {
                 if (!result.data) {
                   result.data = { }
                   result.data.inLists = [ ]
                 }
                 else {
                   result.data.inLists = [ ]
                 }
                 result.data.inLists.push('KARATEL')
               }
               const lists = this.findTwitterIdInLists(userId)
               if (lists.length > 0) {
                 if (!result.data) {
                   result.data = { }
                   result.data.inLists = [ ]
                 }
                 else {
                   if (!result.data.inLists) {
                     result.data.inLists = [ ]
                   }
                 }
                 lists.forEach(listElement => result.data.inLists.push(listElement))
               }
               //console.log(result)
               this.CACHE["twitter"][userId] = result
               return result
             })
             .catch(e => console.error(e))
    }
  }

  findTwitterIdInLists(id) {
    const listNames = Object.keys(this.LISTS.twitter).filter(e => e !== 'KARATEL')
    const inLists = []
    for (let i = 0; i < listNames.length; i++) {
      if (this.CONFIG.lists.lists.twitter[listNames[i]].active) {
        if (this.LISTS.twitter[listNames[i]].indexOf(id) !== -1) {
          inLists.push(listNames[i])
        }
      }
    }
    return inLists
  }

  findYTIdsInLists(id){
    const listNames = Object.keys(this.LISTS.youtube)
    const inLists = []
    for (let i = 0; i < listNames.length; i++) {
      if (this.CONFIG.lists.lists.youtube[listNames[i]].active) {
        if (this.LISTS.youtube[listNames[i]].indexOf(id) !== -1) {
          inLists.push(listNames[i])
        }
      }
    }
    return inLists
  }

  getByYTUser(id, force = false) {
    if (this.CACHE["youtube"][id] && !force) {
      //console.log(`Получение из кэша ${id}, ${JSON.stringify(this.CACHE["youtube"][id])}`)
      return new Promise((resolve, reject) => resolve(this.CACHE["youtube"][id]))
    }
    else {
      //console.log(`Получение с удаленного сервера ${id}`)
      let result = { }
      return fetch(`${this.HOSTNAME}/api/v1/persons/get/youtube/${id}`, this.HEADERS)
             .then(response => response.json())
             .then(_result => {
               //console.log(_result)
               result = _result
               if (!result.data) {
                 result.data = { }
               }
               result.data.inLists = this.findYTIdsInLists(id)
               this.CACHE["youtube"][id] = result
               return result
             })
             .catch(e => console.error(e))
    }
  }


  start() {
    this.loadTwitterLists()//.then(() => console.log(this.LISTS))
    this.loadYoutubeLists()//.then(() => console.log(this.LISTS))
    // инициализация дефолтных настроек для списков
    this.createDefaultOrLoadConfig()
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
      //console.log(request)
      if (request.action === 'getSystemData') {
        sendResponse({ tags: this.TAGS, server: this.HOSTNAME, statuses: this.STATUSES, config: this.CONFIG })
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
        return this.getByYTUser(request.id)
               .catch(e => console.error(e))
      }
      else if (request.action === 'searchOrgs' && request.org) {
        return fetch(`${this.HOSTNAME}/api/v1/orgs/search/${request.org}`, this.HEADERS)
               .then((response) => response.json())
               .catch(e => console.error(e))
      }
      else if (request.action === "addPerson" && request.data && request.type) {
        console.log("request data - ", request)
        let insertResult = null
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
                    insertResult = data
                    if (request.type === "twitter") {
                      return this.getByTwitterId(request.data.id, true)
                    }
                    else if (request.type === "youtube") {
                      return this.getByYTUser(request.data.id, true)
                    }
                    else if (request.type === "vk") {
                      return this.getPersonByVkId(request.data.id, true)
                    }
                  })
                  .then(() => insertResult)
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
      else if (request.action === 'saveConfig' && request.data) {
        this.CONFIG = request.data
        localStorage["config"] = JSON.stringify(this.CONFIG)
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

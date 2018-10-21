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

  registerInsider() {
    return fetch(`${this.HOSTNAME}/api/v1/insiders/register`, { method: "POST" })
           .then((response) => response.json())
           .then((result) => {
             console.log(`ответ о регистрации ${JSON.stringify(result)}`)
             if (result.data.token && result.data.role) {
               localStorage.setItem("token", result.data.token)
               localStorage.setItem("role", result.data.role)
               localStorage.setItem("region", 77)
               this.HEADERS.headers.token = result.data
             }
             else {
               console.error(`Токен не получен`)
             }
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
    return fetch(`${this.HOSTNAME}/api/v1/persons/get/twitter/${userId}`, this.HEADERS)
           .then((response) => response.json())
  }

  start() {
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
        return fetch(`${this.HOSTNAME}/api/v1/persons/get/youtube/${request.id}`, this.HEADERS)
               .then((response) => response.json())
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
        console.log('getByTwitterId')
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

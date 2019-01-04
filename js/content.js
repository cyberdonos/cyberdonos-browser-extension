class CyberdonosContentJSListener {

  constructor() {
    this.PERSONS = {
      twitter: {},
      vk: {},
      facebook: {},
      youtube: {}
    }
    this.TAGS = [],
    this.STATUSES = [],
    this.ROLE_ID = 3,
    this.SERVER = null,
    this.SELECT_TAGS = null
    this.TYPE = null
    this.top30url = `https://www.t30p.ru/search.aspx?`
    this.CONFIG = {}
  }

  findTwitterUsers() {
    console.log(`start search twitter Users`)
    const allProfileActions = document.querySelectorAll('.ProfileTweet-action')
    if (allProfileActions.length > 0) {
      for (let i = 0; i < allProfileActions.length; i++) {
        allProfileActions[i].style.minWidth = '0px'
      }
    }
    const tweets = document.querySelectorAll(`.tweet:not(.cyberdonos-processed):not(.QuoteTweet-originalAuthor):not(.RetweetDialog-tweet)`)
    //console.log(tweets);
    this.findUsers(tweets)
    .then(() => {
      Object.keys(this.PERSONS[this.TYPE]).forEach(userId => {
        if (tweets.length > 0) {
          for (let i = 0; i < tweets.length; i++) {
            if (userId === tweets[i].querySelector('a.account-group').getAttribute('data-user-id')) {
              this.insertTags(tweets[i], userId, 'div.ProfileTweet-actionList', 'strong.fullname')
            }
          }
        }
      })
    })
    .catch(e => console.error(e))
  }

  // FACEBOOK

  // VKONTAKTE
  findVKUsers() {
    console.log('starting search vk users')
    const comments = document.querySelectorAll(`div.reply_wrap:not(.cyberdonos-processed)`)
    const fans = document.querySelectorAll(`div.fans_fan_row:not(.cyberdonos-processed)`)
    const profilePage = document.querySelectorAll("div.page_top:not(.cyberdonos-processed)")
    const posts = document.querySelectorAll('._post:not(.cyberdonos-processed)')
    Promise.all([this.findUsers(comments), this.findUsers(fans), this.findUsers(profilePage), this.findUsers(posts)]).then(() => {
      const fansContainers = document.querySelectorAll('div.fans_fan_row')
      if (fansContainers.length > 0) {
        fansContainers.forEach(e => {
          e.classList.add('vk-fans-enlarged')
        })
      }

      const userIds = Object.keys(this.PERSONS[this.TYPE])

      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i]
        try {
          if (comments.length > 0) {
            for (let i = 0; i < comments.length; i++) {
              if (userId === comments[i].querySelector(`a.author`).getAttribute('data-from-id')) {
                this.insertTags(comments[i], userId, 'div.reply_author', 'a.author')
              }
            }
          }
        } catch (e) {
          console.error(`Ошибка при итерации комментариев ${e}`)
        }
        try {
          if (fans.length > 0) {
            for (let i = 0; i < fans.length; i++) {
              if (userId === fans[i].getAttribute('data-id')) {
                this.insertTags(fans[i], userId, 'div.fans_fan_name', 'a.fans_fan_lnk')
              }
            }
          }
        } catch (e) {
          console.error(`Ошибка при итерации фанов ${e}`)
        }
        try {
          if (profilePage.length > 0) {
            for (let i = 0; i < profilePage.length; i++) {
              if (profilePage[i] === document.querySelector('a#profile_photo_link').getAttribute('href').split("_")[0].split("/photo")[1]) {
                this.insertTags(profilePage[i], userId, 'h2.page_name', 'h2.page_name')
              }
            }
          }
        } catch (e) {
          console.error(`Ошибка при итерации profile_page ${e}`)
        }
        try {
          if (posts.length > 0) {
            for (let i = 0; i < posts.length; i++) {
              if (posts[i] && posts[i].querySelector('a.author').getAttribute('data-from-id') === userId) {
                this.insertTags(posts[i], userId, 'div.like_cont', 'a.author')
              }
            }
          }
        } catch (e) {
          console.error(`Ошибка при итерации ._posts ${e}`)
        }
      }
    })
    .catch(e => console.error(e))
  }

  // youtube
  findYoutubeUsers(){
    const comments = document.querySelectorAll(`div#main:not(.cyberdonos-processed)`)
    const commentsProcessed = document.querySelectorAll(`div#main.cyberdonos-processed`)
    if (commentsProcessed.length > 0) {
      //убрать зависшие теги
      try {
        for (let i = 0; i < commentsProcessed.length; i++) {
          const cyberdonosTags = commentsProcessed[i].querySelector('div.cyberdonos-tags')
          if (cyberdonosTags) {
            const authorId = commentsProcessed[i].querySelector('a#author-text').getAttribute('href').split('/').pop()
            const cyberdonosTagsUserId = cyberdonosTags.getAttribute('id')
            if (authorId !== cyberdonosTagsUserId) {
              cyberdonosTags.parentNode.removeChild(cyberdonosTags)
              commentsProcessed[i].classList.remove('cyberdonos-processed')
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    if (comments.length > 0) {
      Promise.all([this.findUsers(comments)])
      .then(() => {
        const userIds = Object.keys(this.PERSONS.youtube)
        for (let i = 0; i < userIds.length; i++) {
          const userId = userIds[i]
          for (let i = 0; i < comments.length; i++) {
            if (userId === comments[i].querySelector('a#author-text').getAttribute('href').split('/').pop()) {
              this.insertTags(comments[i], userId, 'div#toolbar', 'span.ytd-comment-renderer')
            }
          }
        }
      })
      .catch(e => console.error(e))
    }
  }

  // GENERIC
  createProofPopup() {
    if (!document.querySelector(`div.cd-proof-popup`)) {
      console.log('Добавление окна с пруфами...')
      document.body.insertAdjacentHTML(
        'beforeend',
        `<div class="cd-proof-popup">
        <div class="cd-close-proof" title="Закрыть">X</div>
        <div class="cd-proof-wrapper">
          <p class="cd-proof-text">
          </p>
        </div>
        </div>`
      )
      document.querySelector(`div.cd-close-proof`).addEventListener('click', () => {
        document.querySelector(`div.cd-proof-popup`).style.display = 'none'
      })
      document.querySelector(`div.cd-close-proof`).addEventListener('click', () => {
        document.querySelector(`div.cd-proof-popup`).style.display = 'none'
      })
      console.log('Окно с пруфами добавлено')
    }
  }

  createAbusePopup() {
    if (!document.querySelector(`div.cd-abuse-popup`)) {
      console.log(`Добавления окна для жалобы...`)
      document.body.insertAdjacentHTML(
      'beforeend',
      `<div class="cd-abuse-popup">
           <input class="cd-abuse-user-id hidden-input" />
           <input class="cd-abuse-type hidden-input" />
           <div class="cd-close-abuse" title="Закрыть">X</div>
           <div class="cd-abuse-wrapper">
             <h2 class="cd-abuse-header-abuse">Жалоба - макс 140 символов, мин 30</h2>
             <textarea class="cd-abuse-text" name="abuse-text"/>
             <h2>Ответ от администрации</h2>
             <p class="cd-abuse-answer"></p>
             <button class="cd-apply-abuse">Подать жалобу/изменить</button>
            </div>
          </div>`
      )
      document.querySelector(`div.cd-close-abuse`).addEventListener('click',
      () => {
        document.querySelector(`div.cd-abuse-popup`).style.display = 'none'
      })
      // document.querySelector(`button.cd-apply-abuse`).addEventListener('click', () => {
      //   const text = document.querySelector(`textarea.cd-abuse-text`).value
      //   const vkId = document.querySelector(`input.cd-abuse-user-id`).value
      //   if (text.length > 30 && text.length < 140 && parseInt(vkId)) {
      //     browser.runtime.sendMessage({ action: "sendAbuse", data: { vk_id: vkId, text: text } })
      //     .then((response) => {
      //       if (response.data) {
      //         alert(response.data)
      //       }
      //       else {
      //         alert(response.error)
      //       }
      //     })
      //     .catch(e => console.error(e))
      //   }
      //   else {
      //     alert('Ошибка в полях!')
      //   }
      // })
      console.log(`Окно для подачи жалобы добавлено.`)
    }
  }

  addPersonPopup() {
    if (!document.querySelector(`div.cd-add-person-popup`)) {
      console.log('Добавление окна с добавлением людей...')
      // попап для добавления людей в базу
      document.body.insertAdjacentHTML('beforeend',
      `<div class="cd-add-person-popup">
        <div class="cd-add-person-wrapper">
          <input class="cd-name_when_added hidden-input" />
          <input class="cd-user-id hidden-input" />
          <input class="cd-type hidden-input" />
          <div class="cd-add-new-person-input-element">
            id: <span class="cd-user-id"></span>, имя: <span class="cd-name_when_added"></span>
            <button class="cd-add-new-person-close float-right">Х</button>
            <button class="add-new-person-submit float-right">Добавить</button>
          </div>
          <div class="cd-add-new-person-input-element sixhundredpxwidth">
            <h3>Выберите теги (максимум 5) CTRL + для выбора нескольких</h3>
            <select name="cd-select-tags" class="cd-select-tags float-left small-text" id="cd-select-tags" multiple></select>
          </div>
          <div class="cd-add-new-person-input-element">
            <h3>Пруфы (максимум 767 символов)</h3>
            <textarea maxlength="767" class="cd-add-person-proof float-left add-person-textarea" name="cd-add-person-proof"></textarea>
            <br/>
          </div>
          <div class="cd-add-new-person-input-element">
            <h3 class="choose-org-org-enter">Выберите Организацию (необязательно) - если введете - то будет использоватьс как имя организации/или выбранная из списка</h3>
            <input name="cd-search-org" class="cd-search-org" />
            <button class="cd-search-org-button">ПОИСК</button>
          </div>
          <div class="cd-add-new-person-input-element sixhundredpxwidth">
            <select class="cd-select-org-list sixhundredpxwidth"></select>
          </div>
        </div>
      </div>`)

      // действия по поиску организации
      document.querySelector(`.cd-search-org-button`).addEventListener('click', () => {
        document.querySelector(`select.cd-select-org-list`).value = null
        browser.runtime.sendMessage({ action: "searchOrgs", org: document.querySelector(`input.cd-search-org`).value })
        .then(orgs => {
          if (orgs.data.length > 0) {
            let orgsOptions = orgs.data.map(o => `<option>${o}</option>`)
            const orgsOptionsSize = orgsOptions.length
            orgsOptions.push(`<option value="null" selected>Найдено ${orgsOptionsSize}</option>`)
            document.querySelector(`select.cd-select-org-list`).innerHTML = orgsOptions.join('')
            document.querySelector(`select.cd-select-org-list`).style.display = ''
            document.querySelector(`select.cd-select-org-list`).addEventListener('change', () => {
              if (document.querySelector(`select.cd-select-org-list`).value !== null) {
                document.querySelector(`input.cd-search-org`).value = null
              }
            })
          }
          else {
            document.querySelector(`h3.choose-org-org-enter`).textContent = 'Или можете добавить новую - введите имя'
            document.querySelector(`select.cd-select-org-list`).value = null
            document.querySelector(`select.cd-select-org-list`).innerHTML = ''
            document.querySelector(`select.cd-select-org-list`).style.display = 'none'
            console.error(`Ничего не найдено.`)
          }
        })
      })
      // функция очистки полей
      const clearFields = () => {
        document.querySelector(`select.cd-select-org-list`).value = null
        document.querySelector(`input.cd-search-org`).value = null
        document.querySelector(`textarea.cd-add-person-proof`).value = null
        //this.SELECT_TAGS.destroy()
        document.querySelector(`select.cd-select-tags`).value = null
        document.querySelector(`div.cd-add-person-popup`).style.display = 'none'
      }
      // закрываем окно для добавление персоны
      document.querySelector(`.cd-add-new-person-close`).addEventListener('click', () => {
        clearFields()
      })
      // Добавление персоны
      document.querySelector(`button.add-new-person-submit`).addEventListener('click', () => {
        //console.log($(`.cd-select-tags`).val());
        let isTagsOk = false
        let tags = []
        const selectedOptions = document.querySelectorAll(`.cd-select-tags option:checked`)
        if (selectedOptions.length > 0) {
          isTagsOk = true
          tags = Array.from(selectedOptions).map(el => parseInt(el.value))
        }
        document.querySelector(`.cd-select-tags`).options.length
         isTagsOk = document.querySelector(`.cd-select-tags`).value !== null && document.querySelector(`.cd-select-tags`).value.length > 0
        const isProofOk = document.querySelector(`.cd-add-person-proof`).value.length > 10 && document.querySelector(`.cd-add-person-proof`).value.length < 768
        const isNameWhenAddedOk = document.querySelector(`input.cd-name_when_added`).value !== null || document.querySelector(`input.cd-name_when_added`).value !== ""
        const isIdOk = document.querySelector(`input.cd-user-id`).value !== null || document.querySelector(`input.cd-user-id`).value !== ""
        if (isTagsOk && isProofOk && isNameWhenAddedOk && isIdOk) {
          browser.runtime.sendMessage({
            action: "addPerson",
            type: document.querySelector(`input.cd-type`).value,
            data: {
              id: document.querySelector(`input.cd-user-id`).value,
              proof: document.querySelector(`.cd-add-person-proof`).value.trim(),
              org_name: document.querySelector(`select.cd-select-org-list`).value || document.querySelector(`input.cd-search-org`).value || null,
              tags: JSON.stringify(tags),
              name_when_added: document.querySelector(`input.cd-name_when_added`).value
            }
          })
          .then((data) => {
            if (data.data) {
              alert(`Человек успешно добавлен! Данные отобразяться после обновления страницы.`)
            }
            else {
              alert(`Что-то пошло не так!`)
            }
            clearFields()
          })
          .catch(e => console.error(e))
        }
        else {
          alert(`Прошли проверку: Теги - ${isTagsOk}, Пруф - ${isProofOk}, Имя -${isNameWhenAddedOk}, Ид - ${isIdOk}`)
        }
      })
      console.log('Окно с добавлением людей вставлено.')
    }
  }

  findUsers(selector){
    console.log("find userIds in selector...")
    return new Promise((resolve, reject) => {
      //console.log(selector)
      if (selector.length === 0) {
        resolve()
        console.error(`Селектор пуст.`)
      }
      else {
        if (this.TYPE === "youtube") {
          let userIds = []
          for (let i = 0; i < selector.length; i++) {
            let userId = selector[i].querySelector('a#author-text').getAttribute('href').split('/').pop()
            if (userIds.indexOf(userId) === -1 && this.PERSONS.youtube[userId] === undefined) {
              userIds.push(userId)
            }
          }
          console.log(`${userIds.length} uniq userIds`)
          this.fillPersonsByUserIdsAndNulls(userIds)
          let getUsersP = userIds.map(e => browser.runtime.sendMessage({ action: 'getYoutubeUser', id: e }))
          Promise.all(getUsersP)
          .then((results) => {
            results.forEach(result => {
              if (result && result.data) {
                this.PERSONS.youtube[result.data.youtube_id] = result.data
              }
            })
            resolve()
          })
          .catch(e => console.error(e))
        }
        else if (this.TYPE === "vk") {
          let userIds = []
          for (let i = 0; i < selector.length; i++) {
            let userId = selector[i].querySelector(`a.author`) ? selector[i].querySelector(`a.author`).getAttribute('data-from-id') : null
            let userIdInLikes = selector[i].getAttribute('data-id')
            let profileId = null
            let profile_photo_link = document.querySelector('a#profile_photo_link')
            if (profile_photo_link) {
              profileId = profile_photo_link.getAttribute('href').split("_")[0].split("/photo")[1]
            }
            if (profileId && !profileId.startsWith("-") && userIds.indexOf(profileId) === -1 && this.PERSONS[this.TYPE][profileId] === undefined) {
              userIds.push(profileId)
            }
            if (userId && !userId.startsWith("-") && userIds.indexOf(userId) === -1 && this.PERSONS[this.TYPE][userId] === undefined) {
              userIds.push(userId)
            }
            if (userIdInLikes && !userIdInLikes.startsWith("-") && userIds.indexOf(userIdInLikes) === -1 && this.PERSONS[this.TYPE][userIdInLikes] === undefined) {
              userIds.push(userIdInLikes)
            }
          }
          console.log(`Найдено ${userIds.length} новых пользователей`)
          //console.log(userIds)
          Promise.all(userIds.map(u => browser.runtime.sendMessage({ action: "getPersonByVkId", data: u })))
          .then((results) => {
            //console.log(results)
            results.forEach((r) => {
              let userId = Object.keys(r)[0]
              this.PERSONS[this.TYPE][userId] = r[userId].data ? Object.assign(r[userId].data, r[userId].dates) : r[userId].dates
            })
            //console.log(this.PERSONS[this.TYPE])
            resolve()
          })
          .catch(e => console.error(e))
        }
        else if (this.TYPE === "facebook") {

        }
        else if (this.TYPE === "twitter") {
          let userIds = []
          for (let i = 0; i < selector.length; i++) {
            let userId = selector[i].querySelector('a.account-group').getAttribute('data-user-id')
            if (userId && userIds.indexOf(userId) === -1 && /\d+/.test(userId) && this.PERSONS[this.TYPE][userId] === undefined) {
              userIds.push(userId)
            }
          }
          console.log(`Найдено ${userIds.length} пользователей.`)
          this.fillPersonsByUserIdsAndNulls(userIds)
          const getTwitterUsersPromises = userIds.map(u => browser.runtime.sendMessage({action: "getByTwitterId", id: u}))
          Promise.all(getTwitterUsersPromises)
          .then((results) => {
            //console.log(JSON.stringify(results))
            for (let i = 0; i < results.length; i++) {
              if (results[i].data) {
                this.PERSONS[this.TYPE][userIds[i]] = results[i].data
              }
            }
            resolve()
          })
          .catch(e => console.error(e))
        }
      }
    })
  }

  fillPersonsByUserIdsAndNulls(userIds) {
    for (var i = 0; i < userIds.length; i++) {
      if (!this.PERSONS[this.TYPE][userIds[i]]) {
        this.PERSONS[this.TYPE][userIds[i]] = null
      }
    }
  }

  // add button helper for insert tags

  insertAddButton(element, userId, whereToAppend, whereToGetName, options) {
    if (this.TYPE === 'twitter') {
      let twitMenu = element.querySelector('div.ProfileTweet-action div.dropdown-menu ul')
      twitMenu.innerHTML += `<li class="dropdown-divider" role="presentation"></li>`
      twitMenu.innerHTML += `<li role="presentation"><a href="#" class="add-to-cyberdonos">Настрочить кибердонос</a></li>`
    }
    else {
      if (!element.querySelector(`div.cyberdonos-tags`).querySelector('.add-to-cyberdonos')) {
        element.querySelector(`div.cyberdonos-tags`).insertAdjacentHTML(
          'beforeend',
          `<img src="${browser.extension.getURL("assets/add.png")}" title="Добавить в базу" class="cyberdonos-tag add-to-cyberdonos cursor-pointer" id="${userId}" />`
        )
      }
    }
    let nameWhenAdded
    if (options && options.userName) {
      nameWhenAdded = options.userName
    }
    else {
      if (this.TYPE === 'youtube') {
        nameWhenAdded = element.querySelector('a#author-text').textContent.trim()
      }
      else {
        nameWhenAdded = element.querySelector(whereToGetName).textContent.trim()
      }
    }
    // добавляем поиск по top30 и дату регистрации
    if (this.TYPE === 'youtube') {
      element.querySelector(`div.cyberdonos-tags`).insertAdjacentHTML(
        'beforeend',
        `<a href="${this.top30url}s=server:youtube.com ${encodeURIComponent(nameWhenAdded)}"  target="_blank"><img src="${browser.extension.getURL("assets/top30.png")}" title="Найти упоминания юзера в top30" class="cyberdonos-tag cursor-pointer" id="${userId}" /></a>`
      )
      element.querySelector(`div.cyberdonos-tags`).insertAdjacentHTML('beforeend',`<b class="cyberdonos-tag">Регистрация: ${this.PERSONS[this.TYPE][userId] ? this.PERSONS[this.TYPE][userId].registration_date : "Ошибка" }</b>`)
    }
    if (this.TYPE === 'vk') {
      if (!element.querySelector('a.cyberdonos-vk-mentions')) {
        element.querySelector(`div.cyberdonos-tags`).insertAdjacentHTML(
          'beforeend',
          `<a href="https://vk.com/al_feed.php?obj=${userId}&q=&section=mentions"  target="_blank" class="cyberdonos-tag cyberdonos-vk-mentions">Найти упоминания</a>`
        )
      }
    }
    if (this.TYPE === 'twitter') {
      let username = element.querySelector('span.username > b').textContent || null
      element.querySelector(`div.cyberdonos-tags`).insertAdjacentHTML(
        'beforeend',
        `<a href="${this.top30url}s=server:twitter.com ${username}"  target="_blank"><img src="${browser.extension.getURL("assets/top30.png")}" title="Найти юзера в top30" class="cyberdonos-tag cursor-pointer" id="${userId}" /></a>`
      )
    }
    element.querySelector(`.add-to-cyberdonos`).addEventListener('click', () => {
      //document.querySelector(`select.cd-select-tags`).innerHTML = this.TAGS.map(t => `<option value="${t.id}">${t.name}</option>`).join('')
      // this.SELECT_TAGS = new Choices(document.getElementsByClassName("cd-select-tags")[0], {
      //   removeItems: true,
      //   removeItemButton: true,
      //   maxItemCount: 5
      // })
      // this.SELECT_TAGS = new Taggle('cd-select-tags', {
      //   tags: this.TAGS.map(t => t.name)
      // })
      document.querySelector(`select.cd-select-tags`).innerHTML = this.TAGS.map(t => `<option value="${t.id}">${t.name}</option>`).join('')
      // запоняем скрытые поля
      document.querySelector(`input.cd-name_when_added`).value = nameWhenAdded
      document.querySelector(`span.cd-name_when_added`).textContent = nameWhenAdded
      document.querySelector(`span.cd-user-id`).textContent = userId
      document.querySelector(`input.cd-user-id`).value = userId
      document.querySelector(`input.cd-type`).value = this.TYPE
      // заполнили
      document.querySelector(`.cd-add-person-proof`).value = null
      document.querySelector(`input.cd-search-org`).value = null
      document.querySelector(`input.cd-search-org`).addEventListener('input', () => {
        document.querySelector(`select.cd-select-org-list`).style.display = 'none'
        document.querySelector(`select.cd-select-org-list`).value = null
      })
      document.querySelector(`.cd-select-org-list`).style.display = 'none'
      document.querySelector(`div.cd-add-person-popup`).style.display = 'block'
    })
  }

  insertTags(element, userId, whereToAppend, whereToGetName, options) {
    try {
      const whereToAppendTags = element.querySelector(whereToAppend)
      //console.log(whereToAppendTags)
      const cyberdonosTagsForDiv = ["cyberdonos-tags"]
      if (this.TYPE === 'twitter') {
        cyberdonosTagsForDiv.push("ProfileTweet-action")
      }
      whereToAppendTags.insertAdjacentHTML('beforeend', `<div class="${cyberdonosTagsForDiv.join(' ')}" id="${userId}"></div>`)
      const cyberdonosTags = element.querySelector(`div.cyberdonos-tags`)

      if (this.PERSONS[this.TYPE][userId] && this.PERSONS[this.TYPE][userId].tags) {
        console.log(this.PERSONS[this.TYPE]);
        const user = this.PERSONS[this.TYPE][userId]
        if (user.tags) {
          const tagIds = JSON.parse(user.tags)
          tagIds.forEach((tagId) => {
            let tag = this.TAGS.find(e => e.id == tagId)
            if (tag.base64) {
              cyberdonosTags.insertAdjacentHTML('beforeend', `<img src="data:image/png;base64,${tag.base64}" class="cyberdonos-tag" title="${tag.name}"/>`)
            }
            else {
              let tagUrl = `assets/${tag.icon_name}.png`
              cyberdonosTags.insertAdjacentHTML('beforeend', `<img src="${browser.extension.getURL(tagUrl)}" class="cyberdonos-tag" title="${tag.name}"/>`)
            }
          })
        }
        if (user.proof) {
          cyberdonosTags.insertAdjacentHTML('beforeend', `<img src="${browser.extension.getURL("assets/proof.png")}" title="Пруф: ${user.proof}" class="cyberdonos-tag cursor-pointer cyberdonos-proof" id="${userId}" />`)
          element.querySelector(`img.cyberdonos-proof`).addEventListener('click', () => {
            document.querySelector(`p.cd-proof-text`).textContent = user.proof
            document.querySelector(`div.cd-proof-popup`).style.display = 'block'
          })
        }
        if (user.IsInYTOBSERVER_MANDBList) {
          cyberdonosTags.insertAdjacentHTML('beforeend',`<img src="${browser.extension.getURL("assets/ytkremlebot.png")}" title="Кремлебот из списка YTObserver/metabot for youtube" class="cyberdonos-tag" />`)
        }
        if (user.IsInYTOBSERVERSMMList) {
          cyberdonosTags.insertAdjacentHTML('beforeend',`<img src="${browser.extension.getURL("assets/ytsmm.png")}" title="SMM-бот из списка YTObserver/metabot for youtube" class="cyberdonos-tag" />`)
        }
        if (user.inLists && user.inLists.length > 0) {
          user.inLists.forEach(list => {
            const meta = this.CONFIG.lists.lists[this.TYPE][list]
            cyberdonosTags.insertAdjacentHTML('beforeend',`<img src="${meta.icon_url}" title="${meta.text}" class="cyberdonos-tag" />`)
          })
        }
        if (user.name_when_added) {
          cyberdonosTags.insertAdjacentHTML('beforeend',`<img src="${browser.extension.getURL("assets/name_when_added.png")}" title="Имя при добавлении: ${user.name_when_added}" class="cyberdonos-tag" />`)
        }
        if (user.registration_date) {
          cyberdonosTags.insertAdjacentHTML('beforeend',`<b class="cyberdonos-tag">Регистрация: ${user.registration_date}</b>`)
        }
        // if (user.status_id >= 0) {
        //   const status = this.STATUSES.find(e => e.id === user.status_id)
        //   const statusUrl = `assets/${status.file}.png`
        //   cyberdonosTags.insertAdjacentHTML(
        //     'afterend',
        //     `<img src="${browser.extension.getURL(statusUrl)}" title="${status.name}" class="cyberdonos-tag">`
        //   )
        //   // Добавляем Abuse
        //   cyberdonosTags.insertAdjacentHTML('beforeend', `<img src="${browser.extension.getURL("assets/abuse.png")}" class="cyberdonos-tag cyberdonos-abuse cursor-pointer" id="${userId}" title="Пожаловаться/предложить исправления. Также можете отправить на email cyberdonos@protonmail.com" />`)
        //
        //   // cyberdonosTags.querySelector(`img.cyberdonos-abuse`).addEventListener('click', () => {
        //   //   document.querySelector(`div.cd-abuse-user-id`).value = userId
        //   //   document.querySelector(`input.cd-abuse-type`).value = this.TYPE
        //   //   document.querySelector(`div.cd-abuse-popup`).style.display = 'block'
        //   // })
        //   // Конец Abuse
        // }
        if (user.registerDate && user.lastLoggedIn) {
          if (!cyberdonosTags.querySelector('.vk-registration-date')) {
            cyberdonosTags.insertAdjacentHTML(
              'beforeend',
              `<img src="${browser.extension.getURL("assets/register.png")}" title="Дата регистрации: ${user.registerDate}" class="vk-registration-date"/>`
            )
          }
          if (!cyberdonosTags.querySelector('.vk-last-login-date')) {
            cyberdonosTags.insertAdjacentHTML(
              'beforeend',
              `<img src="${browser.extension.getURL("assets/login.png")}" title="Дата последнего посещения: ${user.lastLoggedIn}" class="vk-last-login-date"/>`
            )
          }
        }
        if (this.TYPE === 'vk' && !user.tags) {
          this.insertAddButton(element, userId, whereToAppend, whereToGetName, options)
        }
        if (user.org_name) {
          cyberdonosTags.insertAdjacentHTML('beforeend',`<span class="cyberdonos-tag">${user.org_name}</span>`)
        }
      }
      else {
        this.insertAddButton(element, userId, whereToAppend, whereToGetName, options)
      }
      element.classList.add('cyberdonos-processed')
    } catch (e) {
      console.error(e)
    }
  }

  insertWindows() {
    this.createProofPopup()
    this.createAbusePopup()
    this.addPersonPopup()
  }

  // MAIN LOOP
  async start() {
    console.log(`cyberdonos content.js is starting...`)
    try {
      const systemDataResults = await browser.runtime.sendMessage({ action: 'getSystemData' })
      this.TAGS = systemDataResults.tags
      this.SERVER = systemDataResults.server
      this.STATUSES = systemDataResults.statuses
      this.CONFIG = systemDataResults.config
      const locationHostname = window.location.hostname
      if ([
        "www.youtube.com",
        "twitter.com",
        "vk.com"
      ].includes(locationHostname)) {
        try {
          this.isReady(() => this.insertWindows())
        } catch (e) {
          console.error(`Не удалось создать окна! ${e}`)
        }
        if (locationHostname === "www.youtube.com") {
          this.TYPE = 'youtube'
          window.onload = () => {
            setInterval(() => this.findYoutubeUsers(), this.CONFIG.updateInterval || 5000)
          }
        }
        else if (locationHostname === "twitter.com") {
          this.TYPE = 'twitter'
          window.onload = () => {
            setInterval(() => this.findTwitterUsers(), this.CONFIG.updateInterval || 5000)
          }
        }
        else if (locationHostname === "vk.com") {
          this.TYPE = 'vk'
          window.onload = () => {
            setInterval(() =>{
              console.log('Start cyberdonos search cycle')
              this.findVKUsers()
            }, this.CONFIG.updateInterval || 6000)
          }
        }
        else {
          console.error(`На домене ${window.location.hostname} cyberdonos не работает.`)
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  isReady(callback){
    if (document.readyState!='loading') callback()
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback)
    else document.attachEvent('onreadystatechange', () => {
      if (document.readyState=='complete') callback()
    })
  }
}

const cyberdonosContentJS = new CyberdonosContentJSListener()
cyberdonosContentJS.start()

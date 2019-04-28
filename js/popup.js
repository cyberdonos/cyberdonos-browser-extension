var config

const getAccountData = () => {

  return browser.runtime.sendMessage({ action: "getAccountData" })
        .then((result) => {
          console.log(`Получены данные об аккаунте ${JSON.stringify(result)}`)
          document.querySelector(`span.role`).textContent = result.role_name
          document.querySelector(`input.token`).value = result.token
          return browser.runtime.sendMessage({ action: "getSystemData" })
        })
        .then((systemDataResults) => {
          //console.log(systemDataResults);
          config = systemDataResults.config
          const listsNames = Object.keys(config.lists.lists.twitter)
          const div = document.getElementsByClassName('twitter-lists')[0]
          listsNames.forEach(listName => {
            const e = config.lists.lists.twitter[listName]
            const cb = document.createElement('input')
            cb.type = 'checkbox'
            cb.checked = e.active
            cb.name = listName
            cb.id = listName
            const label = document.createElement('label')
            label.setAttribute('for', listName)
            label.appendChild(document.createTextNode(listName))
            label.setAttribute('class', 'twitter-list-element')
            const nestedDiv = document.createElement('div')
            nestedDiv.setAttribute('class', 'twitter-list-div')
            nestedDiv.appendChild(cb)
            nestedDiv.appendChild(label)
            div.appendChild(nestedDiv)
          })
          document.getElementsByClassName('updateInterval')[0].value = parseInt(config.updateInterval)
          document.getElementsByClassName('updateListsIntervalInSeconds')[0].value = parseInt(config.updateListsIntervalInSeconds) / 1000
        })
}

document.querySelector(`button.save-config`).addEventListener('click', () => {
  config.updateInterval = parseInt(document.querySelector('.updateInterval').value)
  config.updateListsIntervalInSeconds = parseInt(document.querySelector('.updateListsIntervalInSeconds').value)
  Object.keys(config.lists.lists.twitter).forEach(k => {
    const cb = document.getElementById(k)
    config.lists.lists.twitter[k].active = cb.checked
  })
  browser.runtime.sendMessage({ action: "saveConfig", data: config })
})

document.querySelector(`button.set-token`).addEventListener('click', () => {
  const token = document.querySelector(`input.token`).value
  if (/^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(token)) {
    browser.runtime.sendMessage({ action: "setToken", data: token })
    .then(result => {
      alert(result.message)
    })
    .catch(e => console.error(e))
  }
  else {
    console.log(`Неверный формат`)
  }
})
getAccountData()
.catch(e => console.error(`error in popup.js cyberdonos ${e}`))
console.log("Popup is started")

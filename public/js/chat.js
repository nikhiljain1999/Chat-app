const socket = io()
// Elements
const $messageForm = document.querySelector("#msgform")
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector("#send-location")
const $messages = document.querySelector('#messages')
// socket.on('countUpdated',(count)=>{
//     console.log("The count is updated",count)
// })
// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log("clicked")
//     socket.emit('increment')

// })
// Templetes
const messageTemplete = document.querySelector('#message-template').innerHTML
const locationMessageTemplete=document.querySelector('#location-message-template').innerHTML
const sidebarTemplete=document.querySelector("#sidebar-template").innerHTML
//options
const{username,room}= Qs.parse(location.search,{ignoreQueryPrefix:true})
const autoscroll =()=>{
    // new msg element
    const $newMessage=$messages.lastElementChild
    //height of msg
    const newMessageStyle =getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight =$newMessage.offsetHeight+ newMessageMargin
    console.log(newMessageStyle)

    //visible height
    const visibleHeight =$messages.offsetHeight

    // height of msg cointainer
    const containertHeight =$messages.scrollHeight

    //how far i  have scrolled
    const scrollOffset=$messages.scrollTop+visibleHeight

    if(containertHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop =$messages.scrollHeight
    }
}
socket.on("message", (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplete, {
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('locationMessage',(url)=>{
    
    console.log(url)
    const html =Mustache.render(locationMessageTemplete,{
        username:url.username,
        url,
        createdAt:moment(url.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplete,{
        room,
        users
    })
    console.log(html)
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    //disable

    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        // console.log("The message was deleverse",message)
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ""
        $messageFormInput.focus()
        //enable
        if (error) {
            return console.log(error)
        }
        console.log("Message delivered")
    })
})


$sendLocation.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert("Geo location is not supported by your browser")
    }
    $sendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        socket.emit("sendlocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocation.removeAttribute('disabled')
            console.log("Location Shared")
        })
    })
})
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})
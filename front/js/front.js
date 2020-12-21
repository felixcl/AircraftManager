var vu = new Vue({
      el: '#app',
      vuetify: new Vuetify(),
      data: {
        counter: 0,
        tailnumber: "NNNNN",
        hours: 0
        },
      methods: {
          greet: function(event) {
                alert('Hola')
          }
      }
})
    

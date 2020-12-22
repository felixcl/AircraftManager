var vu = new Vue({
      el: '#app',
      vuetify: new Vuetify(),
      data: {
        wallet: "",
        counter: 0,
        tailnumber: "NNNNN",
        hours: 0,
        acstate: "",
        pricehour: 0,
        hourstolog: 0,
        commenttolog: ""
        },
      methods: {
          logflight: function(event) {
                App.logFlightHour(this.hourstolog,this.commenttolog,this.pay_amount)
          },

          updatePrice: function(event) {
            App.changePricePerHour(this.newprice)
            },

         addcoowner: function(event) {
            App.changecoowner(this.address, true)
            },

          removecoowner: function(event) {
            App.changecoowner(this.address, false)
            },

          sendmechanic: function(event) {
            App.sendMechanic(this.mecaddress, this.maxpay)
            },
      
           receivemechanic: function(event) {
            App.receiveMechanic(this.mecpay)
            }

      },
      computed: {
            pay_amount: function() {
                  return this.pricehour*this.hourstolog;
            },

            state_txt: function() {
                  if(this.acstate == 0)
                        return "Active";
                  else if(this.acstate == 1)
                        return "Maintenance";
                  else return "Unknown";
            }
      }
})
    

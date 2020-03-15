const sulla = require('sulla-hotfix');
const got = require('got');

sulla.create().then(client => start(client));

function start(client) {
   
   console.log("Annie está activa");
   
   //Validación de números para Dream
   function validar(){
      var i=0;
      got('http://cisat.ap/api/numeros/check/ATT-DREAM1-M/ATT-DREAM-T', { json: true }).then(response => {
         for (let tel of response.body ){
            i+=1;
            let tempi=i;
            let timeadd=(tempi*1200)- (Math.floor(Math.random()*600));
            let momento= new Date();
            momento.setSeconds(timeadd);
            horas=momento.getHours();
            minutos=momento.getMinutes();
            segundos=momento.getSeconds();
            console.log(tempi+'\tProgramado: '+tel['numero'] +' - '+horas+":"+xx(minutos)+":"+xx(segundos) );
             setTimeout(  function(){
               console.log(tempi+' - Enviando: '+tel['numero'] );
               client.sendText('xxx', 'Validar por favor:\n'+tel['numero']); // En las xxx se pone el identificador de grupo de Whatsapp
            },timeadd*1000
            );
         };

      }).catch(error => {
         process.exit(0);
      });
   }
   
   // Recepción de mensajes
   client.onMessage(message => {
      //Momento en que se recibe mensaje
      let now= new Date();
      momento=now.getFullYear() + "/" + xx( (now.getMonth() +1) ) + "/" + xx(now.getDate() ) + " - " + now.getHours() + ":" + xx(now.getMinutes() )
      console.log('\n'+momento + " Mensaje recibido de: " + message.from);
      var comandos=message.body.split('/');

      if (comandos[0].toUpperCase()=== 'ANIE' ) {
         console.log("Annie recibe una orden: " + message.body);
         if (comandos[1]==='dame') {
            enviartels( comandos[2],comandos[3] ).then(function (telsmsg){
               client.sendText('xxx', telsmsg[0] ); // En las xxx se pone el id de whats del supervisor
               client.sendText('xxx', telsmsg[1] ); // En las xxx se pone el id de whats del monitorista
            });
         } else if (comandos[1]==='valida'){
            client.sendText(message.from, 'En este momento no hay validaciones posibles' );
         } else if (comandos[1]==='status'){
            status().then(function (status){
               client.sendText(message.from, status );
               client.sendText('5215611565638@c.us', status );
            });
         } else {
            frase( message.sender['pushname'],  now.getHours() ).then(function (frase){
               client.sendText(message.from, frase );
            });
         }
      }
   });
  
}

// Funcion para completar a 2 los dígitos de las fechas
function xx(i) {
   if (i<10){ i="0"+i; }
   return i;
}

function enviartels(cantidad, operador) {
   if (cantidad>500) {cantidad=500}
    return new Promise(function(resolve, reject) {
   regreso=[];
   operador=operador.toUpperCase();
   tels=[];
   canttels=0;
   got.put('http://cisat.ap/api/candidatos/paranip/'+cantidad+'/'+operador, { json: true }).then(response => {
      for (let tel of response.body ){
         tels.push(tel['numero']);
         canttels++;
      };
   tels.sort();
   var numerosstr=tels.join('\n');
   titulo=canttels+' '+operador+' verdes y cancelados, para enviar NIP';
   numeros=titulo+':\n\n'+numerosstr;
   confirmacion='Se enviaron: '+titulo;
   regreso.push(numeros,confirmacion);
   console.log('Se enviaron: '+canttels+' números '+operador);
   resolve (regreso);
   
   }).catch(error => {
      reject();
   });
    })
}

function status() {

   return new Promise(function(resolve) {
   got('http://cisat.ap/api/inicio/damestatus/', { json: true }).then(response => {
      var texto='*STATUS:*\n'+response.body['hora'];
      texto+='\n\n'+'*Números para portar:*';
         for (let operador of response.body['numeros'] ){
            texto+='\n'+operador['operador']+':  '+operador['nuevo'];
         };
      texto+='\n\n'+'*ICCID\'s para portar:*';
         for (let agencia of response.body['iccids'] ){
            texto+='\n'+agencia['agencia']+':  '+agencia['nuevo'];
         };
      texto+='\n\n'+'*Números para enviar NIP:*';
         for (let operador of response.body['candidatos'] ){
            texto+='\n'+operador['operador']+':  '+operador['cancelados'];
         };

      console.log('Se envió status');
      resolve (texto);
   
   }).catch(error => {
      resolve('');
   });
   })
}

function frase(nombre, hora) {

   return new Promise(function(resolve) {
   var saludo='';
   if (hora<12) {saludo='¡Buen día '+nombre+'!'}
   else if (hora>18) {saludo='¡Buena noche! '+nombre+'!'}
   else {saludo='¡Buena tarde! '+nombre+'!'}
   got('http://cisat.ap/api/frase/', { json: true }).then(response => {
      var texto=saludo+', mi nombre es *Anie*\n';
         for (let frase of response.body['cita'] ){
            texto+='\nTe cuento que un día, '+frase['autor']+' dijo:\n\n_'+frase['frase']+'_';
         };
      console.log('Se envió una frase');
      resolve (texto);
   
   }).catch(error => {
      resolve('');
   });
   })
}

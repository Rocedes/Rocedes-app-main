import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Validacion } from '../main/shared/class/Validacion/validacion';
import { DialogoComponent } from '../main/shared/dialogo/dialogo.component';
import {LoginService} from '../main/sis/service/login.service'; 




@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})



export class LoginComponent implements OnInit {


  
  str_user : string = "";
  str_pass : string = "";
  bol_remenber : boolean = false;
  bol_HidePass : boolean = true;
  bol_Load : boolean = false;
 
  public val = new Validacion();




  constructor(private loginserv : LoginService, private dialog: MatDialog) { 
    this.loginserv.VerificarSession();
    this.str_user = this.loginserv.str_user;
    this.str_pass = this.loginserv.str_pass;
    this.bol_remenber = this.loginserv.bol_remenber;
    

    this.val.add("txtLoginUsuario", "1","LEN>", "0");
    this.val.add("txtLoginUsuario", "2","LEN>=", "5");
    this.val.add("txtLoginPass", "1", "LEN>", "0");
    this.val.add("txtLoginPass", "2", "LEN>=", "6");
    this.val.add("check_LogRecordar", "1", "LEN>=", "0");

    

    this.val.ValForm.get("txtLoginUsuario")?.setValue(this.str_user);
    this.val.ValForm.get("txtLoginPass")?.setValue(this.str_pass);
    this.val.ValForm.get("check_LogRecordar")?.setValue(this.bol_remenber);

    /*this.val.ValForm.get("txtLoginUsuario")?.setValue("JMartinez");
    this.val.ValForm.get("txtLoginPass")?.setValue("12345678");
    this.val.ValForm.get("checkBox_Recordar")?.setValue(true);*/

  }


  
  InicioSesion() : void{

    if(this.val.ValForm.invalid) return;

    this.val.ValForm.get("txtLoginUsuario")?.disable();
    this.val.ValForm.get("txtLoginPass")?.disable();
    this.val.ValForm.get("check_LogRecordar")?.disable();

    this.str_user = this.val.ValForm.get("txtLoginUsuario")?.value;
    this.str_pass = this.val.ValForm.get("txtLoginPass")?.value;
    this.bol_remenber = this.val.ValForm.get("check_LogRecordar")?.value;

    this.bol_Load = true;
    this.loginserv.InicioSesion(this.str_user, this.str_pass).subscribe(datos => {
      
      this.val.ValForm.get("txtLoginUsuario")?.enable();
      this.val.ValForm.get("txtLoginPass")?.enable();
      this.val.ValForm.get("check_LogRecordar")?.enable();

      this.bol_Load = false;
      let _json = (JSON.parse(datos));

      if(_json["esError"] == 0)
      {
        if(_json["count"] > 0)
        {
          
          this.loginserv.GuardarSession(this.bol_remenber, this.str_user, this.str_pass, _json["d"]["Nombre"], _json["d"]["Fecha"]);
        }
        else
        {
          this.dialog.open(DialogoComponent, {
            data: _json["msj"],
          });
        }

      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data: _json["msj"],
        });
      }

      
      
     
    } );

  }


  onKeyEnter(event: any){
    

    let _input : string = event.target.id;

    if(event.target.value == "") {
      document?.getElementById(_input)?.focus();
      event.preventDefault();
      return;
    }

    if(_input == "txtLoginUsuario")
    {
      document?.getElementById("txtLoginPass")?.focus();
    }

    event.preventDefault();

  }

  ngOnInit(): void {

   // this.loginserv.InicioSesion().subscribe(datos => this.data$ = JSON.stringify(datos) );
  // this.loginserv.VerificarSession();

  }

  

}

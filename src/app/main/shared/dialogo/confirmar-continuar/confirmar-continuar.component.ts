import { Component, ElementRef, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmar-continuar',
  templateUrl: './confirmar-continuar.component.html',
  styleUrls: ['./confirmar-continuar.component.css']
})
export class ConfirmarContinuarComponent  {

  public Retorno : string = "0";
  public str_Mensaje : string = "<b>Esta seguro de continuar con la operación?</b>";

  constructor(public hostElement: ElementRef, public dialogRef: MatDialogRef<ConfirmarContinuarComponent>,
  @ Inject(MAT_DIALOG_DATA) public data : any) { 
    if(data != undefined) this.str_Mensaje = data;

  }


  Confirmar() : void
  {
    this.dialogRef.close();
    this.Retorno = "1";
  }

  Cancelar() : void
  {
    this.dialogRef.close();
    this.Retorno = "0";
  }


}

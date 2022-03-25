import { Component, ElementRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmar-eliminar',
  templateUrl: './confirmar-eliminar.component.html',
  styleUrls: ['./confirmar-eliminar.component.css']
})
export class ConfirmarEliminarComponent {

  public Retorno : string = "0";

  constructor(public hostElement: ElementRef, public dialogRef: MatDialogRef<ConfirmarEliminarComponent>) { }


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

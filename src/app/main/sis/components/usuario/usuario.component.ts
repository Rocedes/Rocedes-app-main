import { Component, HostListener, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoginService } from '../../service/login.service';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DialogoComponent } from '../../../shared/dialogo/dialogo.component';
import { Validacion } from '../../../shared/class/Validacion/validacion';
import { LiveAnnouncer} from '@angular/cdk/a11y';
import { MatSort, Sort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { _isNumberValue } from '@angular/cdk/coercion';
import { _Schedule } from '@angular/cdk/table';
import { ClsUsuario } from '../../interface/cls-usuario';




/*
1. ngOnChanges
2. ngOnInit
4. ngAfterContentInit
5. ngAfterContentChecked
6. ngAfterViewInit
7. ngAfterViewChecked
8. ngOnDestroy

*/


export interface IUsuario {
  cIndex: number;
  cIdUsuario : number;
  cUsuario: string;
  cPass: string;
  cNombre: string;
  cApellido: string;
  cCodBar : string;
  cActivo : boolean;
}

let ELEMENT_DATA_USUARIO: IUsuario[] = [
  
];



@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.css'],
  encapsulation: ViewEncapsulation.None 
})
export class UsuarioComponent implements OnInit {

  @Input() IndexModulo: number | undefined;
  @Input() public href: string | undefined;
  @HostListener('click', ['$event']) public onClick(event: Event): void {
    if (!this.href || this.href == '#' || (this.href && this.href.length === 0)) {
      var element = <HTMLElement>event.target;
      event.preventDefault();
    }
  }



  str_from : string = "";

  int_IdUsuario : number = 0;


  bol_Load : boolean = false;
  bol_HidePass : boolean = true;
  bol_LoadTabla : boolean = false;
  bol_OpenDialog : boolean = false;
  bol_Activo : boolean = true;



  public val = new Validacion();

  displayedColumns: string[] = ['cIndex', 'cUsuario',  'cNombre', 'cApellido', "cActivo", "cAccion1", "cAccion2", "cAccion3"];
  dataSourceUsuario = new MatTableDataSource(ELEMENT_DATA_USUARIO);
  clickedRows = new Set<IUsuario>();

 
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceUsuario){
      this.dataSourceUsuario.paginator = value;
      if(this.dataSourceUsuario.paginator != null)this.dataSourceUsuario.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceUsuario.sort = sort;
  }



  

  /*************************DIALOGO*****************************************/
  
  dialogRef!: MatDialogRef<DialogoComponent>;
  dialogUsuarioRef!: MatDialogRef<UsuarioComponent>;


  /*************************************************************************/




  


  constructor(private loginserv : LoginService, public dialog: MatDialog, private _liveAnnouncer: LiveAnnouncer) { 
    this.val.add("txtCodbar", "1", "LEN>=", "0");
    this.val.add("txtNombre", "1", "LEN>", "0");
    this.val.add("txtApellido", "1", "LEN>=", "0");
    this.val.add("txtUsuario", "1","LEN>", "0");
    this.val.add("txtUsuario", "2","LEN>=", "5");
    this.val.add("txtPass", "1", "LEN>", "0");
    this.val.add("txtPass", "2", "LEN>=", "6");
    this.LimpiarForm();
    
  }




  /*************************EVENTOS FORM USUARIOS*****************************/

 
  Cerrar(){

    if( this.str_from == "dialog") this.dialog.getDialogById("DialogoUsuario")?.close();
 

    this.LimpiarForm();
    this.str_from = "";
  }


  LimpiarForm(){

    this.int_IdUsuario = 0;
    this.bol_Activo = true;
    this.bol_OpenDialog = false;

    this.val.ValForm.get("txtCodbar")?.setValue("");
    this.val.ValForm.get("txtNombre")?.setValue("");
    this.val.ValForm.get("txtApellido")?.setValue("");
    this.val.ValForm.get("txtUsuario")?.setValue("");
    this.val.ValForm.get("txtPass")?.setValue("");
    this.val.ValForm.reset();

    
    document?.getElementById("txtCodbar")?.focus();
    document?.getElementById("body")?.classList.remove("disabled");

    if( this.dialogRef != null)this.dialogRef.close();
    if( this.dialogUsuarioRef != null)this.dialogUsuarioRef.close();
  }

  /*************************************************************************/





  /*************************EVENTOS INPUT***********************************/
  onChangeEvent(event: any){

    let _value  : string = event.target.value;

    if(_value.length <= 2) return;

    if(this.bol_Load) return;

    this.bol_Load = true;

    let elementFocus : string = document.activeElement!.id
    
    this.loginserv.BuscarCodBarra(_value).subscribe(datos => {
      
      let _json = (JSON.parse(datos));

   
      if(_json["count"] > 0)
      {
        if(Object.keys(_json["d"]).length = 1)
        {

          this.val.ValForm.get("txtNombre")?.setValue(_json["d"][0]["Nombres"]);
          this.val.ValForm.get("txtApellido")?.setValue(_json["d"][0]["Apellidos"]);
          this.val.ValForm.get("txtUsuario")?.setValue(_json["d"][0]["Login"]);

          this.bol_Load = false;
          
        }
        else
        {
          this.dialogRef = this.dialog.open(DialogoComponent, {
            data: _json["msj"]
          });


          this.dialogRef.afterClosed().subscribe(() => {
            document?.getElementById(elementFocus)?.focus();
          });

         

        }
      }
      else{

        this.dialogRef = this.dialog.open(DialogoComponent, {
          data: _json["msj"]
        });


        this.dialogRef.afterClosed().subscribe(() => {
          document?.getElementById(elementFocus)?.focus();
        });

        this.bol_Load = false;

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



    switch(_input){

      case "txtCodbar":
        this.onChangeEvent(event);
        document?.getElementById("txtPass")?.focus();
        break;

        case "txtNombre":
        document?.getElementById("txtApellido")?.focus();
        break;

        case "txtApellido":
          document?.getElementById("txtUsuario")?.focus();
          break;

          case "txtUsuario":
          document?.getElementById("txtPass")?.focus();
          break;

          case "txtPass":
            document?.getElementById("btnGuardar")?.focus();
            break;
    }
    event.preventDefault();

  }

  /*************************************************************************/


  /*************************EVENTOS BOTON***********************************/
  fn_nUsuario(){

    let _Usuario = new ClsUsuario();
    let evento : string = "";

    _Usuario.IdUsuario = this.int_IdUsuario;
    _Usuario.Activo = this.bol_Activo;
    _Usuario.CodBar = this.val.ValForm.get("txtCodbar")?.value;
    _Usuario.Nombres = this.val.ValForm.get("txtNombre")?.value;
    _Usuario.Apellidos = this.val.ValForm.get("txtApellido")?.value;
    _Usuario.Login = this.val.ValForm.get("txtUsuario")?.value;
    _Usuario.Pass = this.val.ValForm.get("txtPass")?.value;

    if(_Usuario.CodBar == null) _Usuario.CodBar = "";
    if(_Usuario.Apellidos == null) _Usuario.Apellidos = "";



    if (this.val.ValForm.invalid) {
      return;
    }

  
    if(this.int_IdUsuario == 0){

      this.loginserv.Nuevo(_Usuario).subscribe( d =>{
      
        let _json = (JSON.parse(d));
  
        this.dialogRef = this.dialog.open(DialogoComponent, {
          data: _json["msj"],
        });
  
        if(_json["esError"] == 0){
         

          this.dialogRef.afterClosed().subscribe(() => {
            this.LimpiarForm();
          });
          
        }
        
        
      });

    }

    else{

      if(!_Usuario.Activo) evento = "Eliminar"

      this.EditarUsuario(_Usuario, evento);

    }

    

  }

  EditarUsuario(_Usuario : ClsUsuario, evento : string) : void{
    this.loginserv.Editar(_Usuario).subscribe( d =>{
      
      let _json = (JSON.parse(d));

      this.dialogRef = this.dialog.open(DialogoComponent, {
        data: _json["msj"],
      });


  


      this.dialogRef.afterOpened().subscribe(() => {
         document.getElementById("body")?.classList.add("disabled");
      });

      this.dialogRef.afterClosed().subscribe(() => {
        this.dialog.getDialogById("DialogoUsuario")?.close();
        if(evento != "") document.getElementById("body")?.classList.remove("disabled");
     });
  
      

      if(_json["esError"] == 0){
        this.llenarTabla();
      }
      
      
    });
  }
  /**************************************************************************/




 


  /*************************EVENTOS TABLA************************************/

  
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceUsuario.filter = filtro.trim().toLowerCase();
  }  
 

  llenarTabla(){

    this.loginserv.BuscarRegistros().subscribe( s => {

      let _json = JSON.parse(s);
      let i : number = 1;



      if(_json["esError"] == 0){

        this.dataSourceUsuario.data.splice(0, this.dataSourceUsuario.data.length);

        _json["d"].forEach((b: {  IdUsuario : number;  Login: string; Pass: string; Nombres: string; Apellidos: string; CodBar : string; Activo : boolean }) => {

          this.dataSourceUsuario.data.push({cIndex: i, cIdUsuario : b.IdUsuario, cUsuario: b.Login , cPass : b.Pass, cNombre: b.Nombres, cApellido: b.Apellidos, cCodBar : b.CodBar, cActivo : b.Activo})
          i+=1;
          
        });


        
        this.dataSourceUsuario.filter = '';

        
      }
      else{
        this.dialogRef = this.dialog.open(DialogoComponent, {
          data: _json["msj"],
        });
      }

    });

    //this.dataSourceUsuario.data.push({cIndex: 1, cUsuario: '', cNombre: '', cApellido: ''})
  }

  clickRow(evento : string, row : any){


    this.bol_OpenDialog = true;
    //if(this.dialogUsuarioRef != null) this.dialogUsuarioRef.close();

    
    if(evento == "Editar"){

      if(this.dialog.getDialogById("DialogoUsuario") == null)
      {
        this.dialogUsuarioRef = this.dialog.open(UsuarioComponent, { id: "DialogoUsuario" });
      }




      this.dialogUsuarioRef.componentInstance.str_from = "dialog";
       
      this.dialogUsuarioRef.componentInstance.int_IdUsuario = row.cIdUsuario;
      this.dialogUsuarioRef.componentInstance.bol_Activo = row.cActivo;
      this.dialogUsuarioRef.componentInstance.val.ValForm.get("txtCodbar")?.setValue(row.cCodBar);
      this.dialogUsuarioRef.componentInstance.val.ValForm.get("txtNombre")?.setValue(row.cNombre);
      this.dialogUsuarioRef.componentInstance.val.ValForm.get("txtApellido")?.setValue(row.cApellido);
      this.dialogUsuarioRef.componentInstance.val.ValForm.get("txtUsuario")?.setValue(row.cUsuario);
      this.dialogUsuarioRef.componentInstance.val.ValForm.get("txtPass")?.setValue(row.cPass);
      

      this.dialogUsuarioRef.componentInstance.val.ValForm.get("txtCodbar")?.disable();
      this.dialogUsuarioRef.componentInstance.val.ValForm.get("txtNombre")?.disable();
      this.dialogUsuarioRef.componentInstance.val.ValForm.get("txtApellido")?.disable();
      this.dialogUsuarioRef.componentInstance.val.ValForm.get("txtUsuario")?.disable();
      
      
      this.dialogUsuarioRef.afterOpened().subscribe( s =>{
        document.getElementById("body")?.classList.add("disabled");
      });
      
      this.dialogUsuarioRef.beforeClosed().subscribe( s =>{
        document.getElementById("body")?.classList.remove("disabled");
      });


    }
    else{
      this.int_IdUsuario = row.cIdUsuario;
      this.bol_Activo = true;
      if(evento == "Eliminar") this.bol_Activo = false

      
    let _Usuario = new ClsUsuario();

    _Usuario.IdUsuario = this.int_IdUsuario;
    _Usuario.Activo = this.bol_Activo;
    _Usuario.CodBar = row.cCodBar;
    _Usuario.Nombres = row.cNombre;
    _Usuario.Apellidos = row.cApellido;
    _Usuario.Login = row.cUsuario;
    _Usuario.Pass = row.cPass;

      this.EditarUsuario(_Usuario, evento);
    }
  


  }

   /*************************************************************************/

 

  

  ngOnInit(): void {
    

    if(this.str_from == "frmUsuario"){
      this.LimpiarForm();
      
    }

      

      if(this.str_from == "frmRegistros"){
        this.llenarTabla();
      }

  }



  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Usuarios`;  // customize this line
    if (length == 0 || pageSize == 0) {
      return `${initialText} 0 of ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length 
      ? Math.min(startIndex + pageSize, length) 
      : startIndex + pageSize;
    return `${initialText} ${startIndex + 1} de ${endIndex} Total: ${length}`; // customize this line
  };



}






import { asLiteral } from "@angular/compiler/src/render3/view/util";
import { ElementRef, Renderer2, RendererFactory2 } from "@angular/core";

export class Formulario
{

    public _Form : string = '';
    public _Nombre : string = '';
    public _Activo : boolean = false;
    public _Esquema : string = '';

    constructor(Id : string, Nombre : string, Activo : boolean, Esquema : string){
        this._Form = Id;
        this._Nombre = Nombre;
        this._Activo = Activo;
        this._Esquema = Esquema;
    }



}


export class Esquema {


    
    public _Esquema : string = '';
    public _Id : string = '';

    private _Form : Formulario[] = [];


    constructor(){}

    public add(Esquema : string, Id :  string, Nombre : string, Activo : boolean){
        this._Form.push( new Formulario(Id , Nombre, Activo, Esquema));
    }


    private buscar(id : string) : Formulario{
        let form : Formulario;



        if(id == ""){
            form = <Formulario>this._Form.find(x => x._Activo);
        }
        else{
            form = <Formulario>this._Form.find(x => x._Form == id);
        }
        
      
        return form;
    }



    ActivarForm(m : string){
        let form : Formulario = <Formulario>this.buscar(m);

        this._Id = "";
        this._Esquema = "";

        if(form != null)
        {
            form._Activo = true;

            this._Form.forEach(element => {

                if(m != element._Form){
                    element._Activo = false;
                }
                
            });

            this._Id = form._Form;
            this._Esquema = form._Esquema;
        }

      
    }

    getActivo() : string{
        let form : Formulario = <Formulario>this._Form.find(x => x._Activo);

        if(form != null)
        {
            return form._Form;
        }

        return "";
    }
   
   
}

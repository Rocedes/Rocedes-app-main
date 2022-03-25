`<reference types="reports.all" />`



import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from "@angular/material/icon";
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSortModule} from '@angular/material/sort';
import { ModalModule } from 'ng-modal-lib';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatSidenavModule} from '@angular/material/sidenav';
import { NgxMatMomentModule, NgxMatMomentAdapter, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NGX_MAT_DATE_FORMATS, NgxMatDateAdapter } from '@angular-material-components/datetime-picker';


import {MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';


import {  faBroom,  faSave, faBarcode, faTrashAlt, faUserEdit, faDoorClosed, faCheck, faUserCheck, faTrashRestore, faSignOutAlt,
  faSearch, faCircle, faMinusSquare, faFileExcel, faPrint, faSuitcase, faUnlock, faEraser, faPlus, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
  import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
  import { DialogoComponent } from './main/shared/dialogo/dialogo.component';
  import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
  import { BundleBoxingComponent } from './main/inv/bundle-boxing/components/bundle-boxing.component';
  import {MatAutocompleteModule} from '@angular/material/autocomplete';

  import { UsuarioComponent } from './main/sis/components/usuario/usuario.component';
  import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
  

import { LoginService } from './main/sis/service/login.service';
import { InventarioService } from './main/inv/service/inventario.service';
import { BnNgIdleService } from 'bn-ng-idle';


import { AutofocusDirective } from './main/shared/Directive/autofocus.directive';
import { AlertComponent } from './main/shared/alert/alert/alert.component';
import { ToastComponent } from './main/shared/toast/toast.component';
import { NgbToastModule } from  'ngb-toast';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportBundleBoxingComponent } from './main/inv/bundle-boxing/components/report-bundle-boxing/report-bundle-boxing.component';
import { ReportBundleBoxingTablaComponent } from './main/inv/bundle-boxing/components/report-bundle-boxing-tabla/report-bundle-boxing-tabla.component';
import { DatePipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { NgxBarcodeModule } from 'ngx-barcode';
import { ReportViewerComponent } from './main/shared/report-viewer/report-viewer.component';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import { BoldReportViewerModule } from '@boldreports/angular-reporting-components';

// Report viewer
import '@boldreports/javascript-reporting-controls/Scripts/bold.report-viewer.min';

// data-visualization
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.bulletgraph.min';
import '@boldreports/javascript-reporting-controls/Scripts/data-visualization/ej.chart.min';


import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BundleBoxingSerialComponent } from './main/inv/bundle-boxing/components/bundle-boxing-serial/bundle-boxing-serial.component';
import { BundleBoxingSacoComponent } from './main/inv/bundle-boxing/components/bundle-boxing-saco/bundle-boxing-saco.component';
import { ReportViewerModule } from 'ngx-ssrs-reportviewer';
import { BundleBoxingEnvioComponent } from './main/inv/bundle-boxing/components/bundle-boxing-envio/bundle-boxing-envio.component';
import { DropdownDirective } from './main/shared/Directive/dropdown.directive';
import { FactorTendidoComponent } from './main/Prm/components/tendido/factor-tendido/factor-tendido.component';
import { TendidoTiempoComponent } from './main/Prm/components/tendido/tendido-tiempo/tendido-tiempo.component';
import { AccesoLinkComponent } from './main/sis/components/acceso-link/acceso-link.component';
import { FactorCorteComponent } from './main/Prm/components/corte/factor-corte/factor-corte.component';
import { OpenCloseDirective } from './main/shared/Directive/open-close.directive';
import { FactorCorteTiempoComponent } from './main/Prm/components/corte/factor-corte-tiempo/factor-corte-tiempo.component';
import { FactorFoleoComponent } from './main/Prm/components/foleo/factor-foleo/factor-foleo.component';
import { FoleoDatosComponent } from './main/Prm/components/foleo/foleo-datos/foleo-datos.component';
import { FoleoTiempoComponent } from './main/Prm/components/foleo/foleo-tiempo/foleo-tiempo.component';
import { FlujoCorteComponent } from './main/Prm/components/flujo/flujo-corte.component';
import { CodigoGsdComponent } from './main/Prm/components/operacion/datos-gsd/codigo-gsd.component';
import { ConfirmarEliminarComponent } from './main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { PartesComponent } from './main/Prm/components/operacion/partes/partes.component';
import { TiposTelaComponent } from './main/Prm/components/tipos-tela/tipos-tela.component';
import { SewingComponent } from './main/Prm/components/operacion/sewing/sewing.component';
import { SewingAccuracyComponent } from './main/Prm/components/operacion/sewing-accuracy/sewing-accuracy.component';
import { ProductoComponent } from './main/inv/producto/producto.component';
import { FabricOunceComponent } from './main/Prm/components/operacion/fabric-ounce/fabric-ounce.component';
import { DataMachineComponent } from './main/Prm/components/operacion/data-machine/data-machine.component';
import { MethodAnalysisComponent } from './main/Prm/components/operacion/method-analysis/method-analysis.component';
import { ConfirmarContinuarComponent } from './main/shared/dialogo/confirmar-continuar/confirmar-continuar.component';
import { MatrizOperacionComponent } from './main/Prm/components/operacion/matriz-operacion/matriz-operacion.component';
import { ClienteComponent } from './main/cxc/cliente/components/cliente.component';
import { PlanningComponent } from './main/Pln/components/planning/planning.component';
import { UploadExcelComponent } from './main/shared/upload-excel/upload-excel.component';
import { AngularFileUploaderModule } from "angular-file-uploader";
import { FilePickerModule } from  'ngx-awesome-uploader';
import { EstadoCorteComponent } from './main/Pln/components/estado-corte/estado-corte.component';
import { FamilyComponent } from './main/Prm/components/operacion/family/family/family.component';
import { SecuenceComponent } from './main/Prm/components/operacion/secuence/secuence/secuence.component';
import { StichTypeCatalogueComponent } from './main/Prm/components/operacion/StichType/stich-type-catalogue/stich-type-catalogue.component';
import { NeedleTypeComponent } from './main/Prm/components/operacion/NeedleType/needle-type/needle-type.component';
import { RpmCatalogueComponent } from './main/Prm/components/operacion/RpmCatalogue/rpm-catalogue/rpm-catalogue.component';
import { StichInchCatalogueComponent } from './main/Prm/components/operacion/StichInch/stich-inch-catalogue/stich-inch-catalogue.component';
import { CaliberComponent } from './main/Prm/components/operacion/Caliber/caliber/caliber.component';
import { FeeddogComponent } from './main/Prm/components/operacion/FeedDog/feeddog/feeddog.component';
import { PresserFootComponent } from './main/Prm/components/operacion/PresserFoot/presser-foot/presser-foot.component';
import { FolderComponent } from './main/Prm/components/operacion/Folder/folder/folder.component';
import { ManufacturingComponent } from './main/Prm/components/operacion/Manufacturing/manufacturing/manufacturing.component';



export const CUSTOM_MOMENT_FORMATS  = {
  parse: {
    dateInput: "l, LT"
  },
  display: {
    dateInput: "l, LT",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY"
  }
};


@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    LoginComponent,
    UsuarioComponent,
    DialogoComponent,
    BundleBoxingComponent,
    AutofocusDirective,
    AlertComponent,
    ToastComponent,
    ReportBundleBoxingComponent,
    ReportBundleBoxingTablaComponent,
    ReportViewerComponent,
    BundleBoxingSerialComponent,
    BundleBoxingSacoComponent,
    BundleBoxingEnvioComponent,
    DropdownDirective,
    FactorTendidoComponent,
    TendidoTiempoComponent,
    AccesoLinkComponent,
    FactorCorteComponent,
    OpenCloseDirective,
    FactorCorteTiempoComponent,
    FactorFoleoComponent,
    FoleoDatosComponent,
    FoleoTiempoComponent,
    FlujoCorteComponent,
    CodigoGsdComponent,
    ConfirmarEliminarComponent,
    PartesComponent,
    TiposTelaComponent,
    ClienteComponent,
    SewingComponent,
    SewingAccuracyComponent,
    ProductoComponent,
    FabricOunceComponent,
    DataMachineComponent,
    MethodAnalysisComponent,
    ConfirmarContinuarComponent,
    MatrizOperacionComponent,
    PlanningComponent,
    UploadExcelComponent,
    EstadoCorteComponent,
    FamilyComponent,
    SecuenceComponent,
    StichTypeCatalogueComponent,
    NeedleTypeComponent,
    RpmCatalogueComponent,
    StichInchCatalogueComponent,
    CaliberComponent,
    FeeddogComponent,
    PresserFootComponent,
    FolderComponent,
    ManufacturingComponent,


    
    


  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxBarcodeModule,
    
    FormsModule,


    HttpClientModule,

    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatCardModule,
    MatIconModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    MatSortModule,
    MatSelectModule,



    ReactiveFormsModule,
    FontAwesomeModule,

    MatDialogModule,
    MatAutocompleteModule,
    NgbToastModule,
    NgbModule,
    BrowserModule,
    BoldReportViewerModule,
    ReportViewerModule,
    MatProgressSpinnerModule,
    DragDropModule,
    ModalModule,
    MatSidenavModule,

    NgxMatMomentModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,

    AngularFileUploaderModule,
    FilePickerModule,
    
  ],
  entryComponents: [
    DialogoComponent,
  ],
  providers: [
    
    {provide: LocationStrategy, useClass: HashLocationStrategy},

    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, 
      useValue: "legacy",
   },

   /*{ provide: NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
   { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS },  
   { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },*/
   
   {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},
   {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}},
   { provide: MatPaginatorIntl, useValue: CustomPaginator() },



   
   DatePipe,


   LoginService,
   InventarioService,



   MatDatepickerModule,
   MatNativeDateModule,


   BnNgIdleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(library: FaIconLibrary) {
    // Add multiple icons to the library
    library.addIcons(faBroom, faSave, faBarcode, faTrashAlt, faUserEdit, faDoorClosed, faCheck, faUserCheck, faTrashRestore, faSignOutAlt,
      faSearch, faCircle, faMinusSquare, faFileExcel, faPrint, faSuitcase, faUnlock, faEraser, faPlus, faEdit, faTimes);
  }
}

export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();

  customPaginatorIntl.itemsPerPageLabel = 'Registros por página:';

  return customPaginatorIntl;
}



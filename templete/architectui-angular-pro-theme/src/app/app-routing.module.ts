import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {BaseLayoutComponent} from './Layout/base-layout/base-layout.component';
import {PagesLayoutComponent} from './Layout/pages-layout/pages-layout.component';
import {AppsLayoutComponent} from './Layout/apps-layout/apps-layout.component';

// DEMO PAGES

// Dashboards

import {AnalyticsComponent} from './DemoPages/Dashboards/analytics/analytics.component';
import {AdvertisementComponent} from './DemoPages/Dashboards/advertisement/advertisement.component';
import {ManagementComponent} from './DemoPages/Dashboards/management/management.component';
import {HelpdeskComponent} from './DemoPages/Dashboards/helpdesk/helpdesk.component';
import {MonitoringComponent} from './DemoPages/Dashboards/monitoring/monitoring.component';
import {CryptoComponent} from './DemoPages/Dashboards/crypto/crypto.component';
import {ProjectManagementComponent} from './DemoPages/Dashboards/project-management/project-management.component';
import {ProductComponent} from './DemoPages/Dashboards/product/product.component';
import {StatisticsComponent} from './DemoPages/Dashboards/statistics/statistics.component';

// Applications

import {ChatComponent} from './DemoPages/Applications/chat/chat.component';
import {MailboxComponent} from './DemoPages/Applications/mailbox/mailbox.component';
import {MaterialTabsComponent} from './DemoPages/Applications/material-tabs/material-tabs.component';

// Pages

import {ForgotPasswordComponent} from './DemoPages/UserPages/forgot-password/forgot-password.component';
import {ForgotPasswordBoxedComponent} from './DemoPages/UserPages/forgot-password-boxed/forgot-password-boxed.component';
import {LoginBoxedComponent} from './DemoPages/UserPages/login-boxed/login-boxed.component';
import {LoginComponent} from './DemoPages/UserPages/login/login.component';
import {RegisterBoxedComponent} from './DemoPages/UserPages/register-boxed/register-boxed.component';
import {RegisterComponent} from './DemoPages/UserPages/register/register.component';

// Elements

import {StandardComponent} from './DemoPages/Elements/Buttons/standard/standard.component';
import {PillsComponent} from './DemoPages/Elements/Buttons/pills/pills.component';
import {SquareComponent} from './DemoPages/Elements/Buttons/square/square.component';
import {ShadowComponent} from './DemoPages/Elements/Buttons/shadow/shadow.component';
import {ButtonIconsComponent} from './DemoPages/Elements/Buttons/icons/icons.component';
import {DropdownsComponent} from './DemoPages/Elements/dropdowns/dropdowns.component';
import {BadgesComponent} from './DemoPages/Elements/badges/badges.component';
import {CardsComponent} from './DemoPages/Elements/cards/cards.component';
import {LoadingIndicatorsComponent} from './DemoPages/Elements/loading-indicators/loading-indicators.component';
import {ListGroupsComponent} from './DemoPages/Elements/list-groups/list-groups.component';
import {NavigationMenusComponent} from './DemoPages/Elements/navigation-menus/navigation-menus.component';
import {TimelineComponent} from './DemoPages/Elements/timeline/timeline.component';
import {UtilitiesComponent} from './DemoPages/Elements/utilities/utilities.component';
import {IconsComponent} from './DemoPages/Elements/icons/icons.component';

// Components

import {AccordionsComponent} from './DemoPages/Components/accordions/accordions.component';
import {TabsComponent} from './DemoPages/Components/tabs/tabs.component';
import {CalendarComponent} from './DemoPages/Components/calendar/calendar.component';
import {CarouselComponent} from './DemoPages/Components/carousel/carousel.component';
import {ImageCropComponent} from './DemoPages/Components/image-crop/image-crop.component';
import {CountUpComponent} from './DemoPages/Components/count-up/count-up.component';
import {MapsComponent} from './DemoPages/Components/maps/maps.component';
import {ModalsComponent} from './DemoPages/Components/modals/modals.component';
import {NotificationsComponent} from './DemoPages/Components/notifications/notifications.component';
import {ProgressBarComponent} from './DemoPages/Components/progress-bar/progress-bar.component';
import {PaginationComponent} from './DemoPages/Components/pagination/pagination.component';
import {RatingsComponent} from './DemoPages/Components/ratings/ratings.component';
import {ScrollableComponent} from './DemoPages/Components/scrollable/scrollable.component';
import {TooltipsPopoversComponent} from './DemoPages/Components/tooltips-popovers/tooltips-popovers.component';

// Tables

import {TablesMainComponent} from './DemoPages/Tables/tables-main/tables-main.component';

// Widgets

import {ChartBoxes1Component} from './DemoPages/Widgets/chart-boxes1/chart-boxes1.component';
import {ChartBoxes2Component} from './DemoPages/Widgets/chart-boxes2/chart-boxes2.component';
import {ChartBoxes3Component} from './DemoPages/Widgets/chart-boxes3/chart-boxes3.component';
import {ProfileBoxesComponent} from './DemoPages/Widgets/profile-boxes/profile-boxes.component';

// Forms Elements

import {ControlsComponent} from './DemoPages/Forms/Elements/controls/controls.component';
import {LayoutComponent} from './DemoPages/Forms/Elements/layout/layout.component';
import {ValidationComponent} from './DemoPages/Forms/Elements/validation/validation.component';
import {StickyHeadersComponent} from './DemoPages/Forms/Elements/sticky-headers/sticky-headers.component';

// Forms Components

import {DatepickerComponent} from './DemoPages/Forms/Widgets/datepicker/datepicker.component';
import {TimepickerComponent} from './DemoPages/Forms/Widgets/timepicker/timepicker.component';
import {TypeaheadComponent} from './DemoPages/Forms/Widgets/typeahead/typeahead.component';
import {RangeSliderComponent} from './DemoPages/Forms/Widgets/range-slider/range-slider.component';
import {InputSelectsComponent} from './DemoPages/Forms/Widgets/input-selects/input-selects.component';
import {ToggleSwitchComponent} from './DemoPages/Forms/Widgets/toggle-switch/toggle-switch.component';
import {WysiwygEditorComponent} from './DemoPages/Forms/Widgets/wysiwyg-editor/wysiwyg-editor.component';
import {InputMaskComponent} from './DemoPages/Forms/Widgets/input-mask/input-mask.component';
import {ClipboardComponent} from './DemoPages/Forms/Widgets/clipboard/clipboard.component';
import {TextareaAutosizeComponent} from './DemoPages/Forms/Widgets/textarea-autosize/textarea-autosize.component';
import {ColorpickerComponent} from './DemoPages/Forms/Widgets/colorpicker/colorpicker.component';
import {DropzoneComponent} from './DemoPages/Forms/Widgets/dropzone/dropzone.component';

// Charts

import {ChartjsComponent} from './DemoPages/Charts/chartjs/chartjs.component';
import {ApexchartsComponent} from './DemoPages/Charts/apexcharts/apexcharts.component';
import {GaugesComponent} from './DemoPages/Charts/gauges/gauges.component';
import {SparklinesComponent} from './DemoPages/Charts/sparklines/sparklines.component';

// Angular Material

import {AutoCompleteComponent} from './DemoPages/Material/FormControls/auto-complete/auto-complete.component';
import {CheckboxComponent} from './DemoPages/Material/FormControls/checkbox/checkbox.component';
import {RadioComponent} from './DemoPages/Material/FormControls/radio/radio.component';
import {DatepickerComponent2} from './DemoPages/Material/FormControls/mat-datepicker/mat-datepicker.component';
import {FormFieldComponent} from './DemoPages/Material/FormControls/form-field/form-field.component';
import {InputComponent} from './DemoPages/Material/FormControls/input/input.component';
import {SelectComponent} from './DemoPages/Material/FormControls/select/select.component';
import {SliderComponent} from './DemoPages/Material/FormControls/slider/slider.component';
import {SliderToggleComponent} from './DemoPages/Material/FormControls/slider-toggle/slider-toggle.component';
import {CardMatComponent} from './DemoPages/Material/Layout/card/card.component';
import {DividerComponent} from './DemoPages/Material/Layout/divider/divider.component';
import {ExpansionPanelComponent} from './DemoPages/Material/Layout/expansion-panel/expansion-panel.component';
import {GridListComponent} from './DemoPages/Material/Layout/grid-list/grid-list.component';
import {ListMatComponent} from './DemoPages/Material/Layout/list/list.component';
import {StepperComponent} from './DemoPages/Material/Layout/stepper/stepper.component';
import {TreeComponent} from './DemoPages/Material/Layout/tree/tree.component';
import {ButtonToggleComponent} from './DemoPages/Material/ButtonsIndicators/button-toggle/button-toggle.component';
import {ChipsComponent} from './DemoPages/Material/ButtonsIndicators/chips/chips.component';
import {ProgressSpinnerComponent} from './DemoPages/Material/ButtonsIndicators/progress-spinner/progress-spinner.component';
import {RipplesComponent} from './DemoPages/Material/ButtonsIndicators/ripples/ripples.component';
import {SnackbarComponent} from './DemoPages/Material/Layout/snackbar/snackbar.component';
import {TooltipComponent} from './DemoPages/Material/Layout/tooltip/tooltip.component';
import {PaginatorComponent} from './DemoPages/Material/Datatable/paginator/paginator.component';
import {TableComponent} from './DemoPages/Material/Datatable/table/table.component';
import {MenuMatComponent} from './DemoPages/Material/Layout/menu/menu.component';
import {MatTabsComponent} from './DemoPages/Material/Layout/mat-tabs/mat-tabs.component';
import {MatButtonsComponent} from './DemoPages/Material/ButtonsIndicators/mat-buttons/mat-buttons.component';
import {MatProgressBarComponent} from './DemoPages/Material/ButtonsIndicators/mat-progress-bar/mat-progress-bar.component';

const routes: Routes = [
  {
    path: '',
    component: BaseLayoutComponent,
    children: [

      // Dashboads

      {path: '', component: AnalyticsComponent, data: {extraParameter: 'dashboardsMenu'}},
      {path: 'dashboards/advertisement', component: AdvertisementComponent, data: {extraParameter: 'dashboardsMenu'}},
      {path: 'dashboards/management', component: ManagementComponent, data: {extraParameter: 'dashboardsMenu'}},
      {path: 'dashboards/helpdesk', component: HelpdeskComponent, data: {extraParameter: 'dashboardsMenu'}},
      {path: 'dashboards/monitoring', component: MonitoringComponent, data: {extraParameter: 'dashboardsMenu'}},
      {path: 'dashboards/crypto', component: CryptoComponent, data: {extraParameter: 'dashboardsMenu'}},
      {path: 'dashboards/project-management', component: ProjectManagementComponent, data: {extraParameter: 'dashboardsMenu'}},
      {path: 'dashboards/product', component: ProductComponent, data: {extraParameter: 'dashboardsMenu'}},
      {path: 'dashboards/statistics', component: StatisticsComponent, data: {extraParameter: 'dashboardsMenu'}},

      // Elements

      {path: 'elements/buttons-standard', component: StandardComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/buttons-pills', component: PillsComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/buttons-square', component: SquareComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/buttons-shadow', component: ShadowComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/buttons-icons', component: ButtonIconsComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/dropdowns', component: DropdownsComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/icons', component: IconsComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/badges-labels', component: BadgesComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/cards', component: CardsComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/loaders', component: LoadingIndicatorsComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/list-group', component: ListGroupsComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/navigation-menu', component: NavigationMenusComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/timeline', component: TimelineComponent, data: {extraParameter: 'elementsMenu'}},
      {path: 'elements/utilities', component: UtilitiesComponent, data: {extraParameter: 'elementsMenu'}},

      // Components

      {path: 'components/tabs', component: TabsComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/accordions', component: AccordionsComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/notifications', component: NotificationsComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/modals', component: ModalsComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/progress-bar', component: ProgressBarComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/tooltips-popovers', component: TooltipsPopoversComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/carousel', component: CarouselComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/calendar', component: CalendarComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/pagination', component: PaginationComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/count-up', component: CountUpComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/scrollable-elements', component: ScrollableComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/maps', component: MapsComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/ratings', component: RatingsComponent, data: {extraParameter: 'componentsMenu'}},
      {path: 'components/image-crop', component: ImageCropComponent, data: {extraParameter: 'componentsMenu'}},

      // Tables

      {path: 'tables/bootstrap', component: TablesMainComponent, data: {extraParameter: 'tablesMenu'}},
      {path: 'material/table', component: TableComponent, data: {extraParameter: 'tablesMenu'}},
      {path: 'material/paginator', component: PaginatorComponent, data: {extraParameter: 'tablesMenu'}},

      // Widgets

      {path: 'widgets/chart-boxes-1', component: ChartBoxes1Component, data: {extraParameter: 'pagesMenu3'}},
      {path: 'widgets/chart-boxes-2', component: ChartBoxes2Component, data: {extraParameter: 'pagesMenu3'}},
      {path: 'widgets/chart-boxes-3', component: ChartBoxes3Component, data: {extraParameter: 'pagesMenu3'}},
      {path: 'widgets/profile-boxes', component: ProfileBoxesComponent, data: {extraParameter: 'pagesMenu3'}},

      // Forms Elements

      {path: 'forms/controls', component: ControlsComponent, data: {extraParameter: 'formElementsMenu'}},
      {path: 'forms/layouts', component: LayoutComponent, data: {extraParameter: 'formElementsMenu'}},
      {path: 'forms/validation', component: ValidationComponent, data: {extraParameter: 'formElementsMenu'}},
      {path: 'forms/sticky-headers', component: StickyHeadersComponent, data: {extraParameter: 'formElementsMenu'}},

      // Forms Widgets

      {path: 'forms/datepicker', component: DatepickerComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/timepicker', component: TimepickerComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/typeahead', component: TypeaheadComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/range-slider', component: RangeSliderComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/input-selects', component: InputSelectsComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/toggle-switch', component: ToggleSwitchComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/wysiwyg-editors', component: WysiwygEditorComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/input-mask', component: InputMaskComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/clipboard', component: ClipboardComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/textarea-autosize', component: TextareaAutosizeComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/colorpicker', component: ColorpickerComponent, data: {extraParameter: 'formWidgetsMenu'}},
      {path: 'forms/dropzone', component: DropzoneComponent, data: {extraParameter: 'formWidgetsMenu'}},

      // Charts

      {path: 'charts/chartjs', component: ChartjsComponent, data: {extraParameter: ''}},
      {path: 'charts/apexcharts', component: ApexchartsComponent, data: {extraParameter: ''}},
      {path: 'charts/gauges', component: GaugesComponent, data: {extraParameter: ''}},
      {path: 'charts/sparklines', component: SparklinesComponent, data: {extraParameter: ''}},

      // Angular Material

      // Form Controls

      {path: 'material/auto-complete', component: AutoCompleteComponent, data: {extraParameter: 'materialFormControls'}},
      {path: 'material/checkbox', component: CheckboxComponent, data: {extraParameter: 'materialFormControls'}},
      {path: 'material/radio', component: RadioComponent, data: {extraParameter: 'materialFormControls'}},
      {path: 'material/datepicker', component: DatepickerComponent2, data: {extraParameter: 'materialFormControls'}},
      {path: 'material/form-field', component: FormFieldComponent, data: {extraParameter: 'materialFormControls'}},
      {path: 'material/input', component: InputComponent, data: {extraParameter: 'materialFormControls'}},
      {path: 'material/select', component: SelectComponent, data: {extraParameter: 'materialFormControls'}},
      {path: 'material/slider', component: SliderComponent, data: {extraParameter: 'materialFormControls'}},
      {path: 'material/slider-toggle', component: SliderToggleComponent, data: {extraParameter: 'materialFormControls'}},

      // Layouts

      {path: 'material/cards', component: CardMatComponent, data: {extraParameter: 'materialLayout'}},
      {path: 'material/divider', component: DividerComponent, data: {extraParameter: 'materialLayout'}},
      {path: 'material/expansion-panel', component: ExpansionPanelComponent, data: {extraParameter: 'materialLayout'}},
      {path: 'material/grid-list', component: GridListComponent, data: {extraParameter: 'materialLayout'}},
      {path: 'material/list', component: ListMatComponent, data: {extraParameter: 'materialLayout'}},
      {path: 'material/menu', component: MenuMatComponent, data: {extraParameter: 'materialLayout'}},
      {path: 'material/stepper', component: StepperComponent, data: {extraParameter: 'materialLayout'}},
      {path: 'material/tabs', component: MatTabsComponent, data: {extraParameter: 'materialLayout'}},
      {path: 'material/tree', component: TreeComponent, data: {extraParameter: 'materialLayout'}},

      // Buttons & Indicators

      {path: 'material/progress-bar', component: MatProgressBarComponent, data: {extraParameter: 'materialButtonsIndicators'}},
      {path: 'material/buttons', component: MatButtonsComponent, data: {extraParameter: 'materialButtonsIndicators'}},
      {path: 'material/button-toggle', component: ButtonToggleComponent, data: {extraParameter: 'materialButtonsIndicators'}},
      {path: 'material/chips', component: ChipsComponent, data: {extraParameter: 'materialButtonsIndicators'}},
      {path: 'material/progress-spinner', component: ProgressSpinnerComponent, data: {extraParameter: 'materialButtonsIndicators'}},
      {path: 'material/ripples', component: RipplesComponent, data: {extraParameter: 'materialButtonsIndicators'}},
      {path: 'material/snackbar', component: SnackbarComponent, data: {extraParameter: 'materialButtonsIndicators'}},
      {path: 'material/tooltip', component: TooltipComponent, data: {extraParameter: 'materialButtonsIndicators'}},
    ]

  },
  {
    path: '',
    component: PagesLayoutComponent,
    children: [

      // User Pages

      {path: 'pages/login', component: LoginComponent, data: {extraParameter: ''}},
      {path: 'pages/login-boxed', component: LoginBoxedComponent, data: {extraParameter: ''}},
      {path: 'pages/register', component: RegisterComponent, data: {extraParameter: ''}},
      {path: 'pages/register-boxed', component: RegisterBoxedComponent, data: {extraParameter: ''}},
      {path: 'pages/forgot-password', component: ForgotPasswordComponent, data: {extraParameter: ''}},
      {path: 'pages/forgot-password-boxed', component: ForgotPasswordBoxedComponent, data: {extraParameter: ''}},
    ]
  },
  {
    path: '',
    component: AppsLayoutComponent,
    children: [

      // Applications

      {path: 'apps/chat', component: ChatComponent, data: {extraParameter: 'applicationsMenu'}},
      {path: 'apps/mailbox', component: MailboxComponent, data: {extraParameter: 'applicationsMenu'}},
      {path: 'apps/material-tabs', component: MaterialTabsComponent, data: {extraParameter: 'applicationsMenu'}},
    ]
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}

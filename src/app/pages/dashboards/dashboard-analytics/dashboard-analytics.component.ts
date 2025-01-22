import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import icGroup from "@iconify/icons-ic/twotone-group";
import icPageView from "@iconify/icons-ic/twotone-pageview";
import icCloudOff from "@iconify/icons-ic/twotone-cloud-off";
import icTimer from "@iconify/icons-ic/twotone-timer";
import { defaultChartOptions } from "../../../../@vex/utils/default-chart-options";
import { TableColumn } from "../../../../@vex/interfaces/table-column.interface";
import icMoreVert from "@iconify/icons-ic/twotone-more-vert";
import { GuidesService } from "../../../services/guides.service";
import { GuidesEntPop } from "../../outgoingShippingModules/shipping-guides/interfaces/guides-ent-pop.model";
import { ShippingEnt } from "../../outgoingShippingModules/shipping-registry/interfaces/shipping.model";
import { ShippingService } from "src/app/services/shipping.service";

@Component({
  selector: "vex-dashboard-analytics",
  templateUrl: "./dashboard-analytics.component.html",
  styleUrls: ["./dashboard-analytics.component.scss"],
})
export class DashboardAnalyticsComponent implements OnInit {
  showTable = false;
  tableData: GuidesEntPop[];
  shipTableData: ShippingEnt[];

  tableColumns: TableColumn<GuidesEntPop>[] = [
    { label: "STATUS", property: "status", type: "badge", visible: true },
    { label: "CUSTOMER", property: "customer", type: "text", visible: true },
    {
      label: "GUIDE",
      property: "tlCargoId",
      type: "text",
      cssClasses: ["font-medium"],
      visible: true,
    },
    {
      label: "ACTIONS",
      property: "_id",
      type: "actions",
      cssClasses: ["text-secondary"],
      visible: true,
    },
  ];

  shipTableColumns: TableColumn<ShippingEnt>[] = [
    { label: "STATUS", property: "status", type: "ship-badge", visible: true },
    {
      label: "NAME",
      property: "name",
      type: "text",
      cssClasses: ["font-medium"],
      visible: true,
    },
    { label: "TYPE", property: "type", type: "text", visible: true },
    { label: "DEPT. DATE", property: "departureDate", type: "text", visible: true },
    {
      label: "ACTIONS",
      property: "_id",
      type: "actions",
      cssClasses: ["text-secondary"],
      visible: true,
    },
  ];

  userSessionsSeries: ApexAxisChartSeries = [
    {
      name: "Inventory Packages",
      data: [10, 50, 26, 54],
    },
    {
      name: "Shipping Guides",
      data: [5, 21, 42, 78],
    },
  ];

  salesSeries: ApexAxisChartSeries = [
    {
      name: "Delivered",
      data: [28, 40, 36, 0, 52, 38, 60, 55, 99, 54, 38, 87],
    },
  ];

  pageViewsSeries: ApexAxisChartSeries = [
    {
      name: "Page Views",
      data: [405, 800, 200, 600, 105, 788, 600, 204],
    },
  ];

  uniqueUsersSeries: ApexAxisChartSeries = [
    {
      name: "Unique Users",
      data: [356, 806, 600, 754, 432, 854, 555, 1004],
    },
  ];

  uniqueUsersOptions = defaultChartOptions({
    chart: {
      type: "area",
      height: 100,
    },
    colors: ["#ff9800"],
  });

  icGroup = icGroup;
  icPageView = icPageView;
  icCloudOff = icCloudOff;
  icTimer = icTimer;
  icMoreVert = icMoreVert;

  constructor(
    private cd: ChangeDetectorRef,
    private guidesService: GuidesService,
    private shipService: ShippingService
  ) { }

  ngOnInit() {
    // this.guidesService.getGuides(0, 20, "", false).subscribe((resp) => {
    //   this.shipService.getShipsPag(0, 20, "", "").subscribe((respS) => {
    //     this.shipTableData = respS.data.sort((a, b) => { return new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime() });
    //     this.tableData = resp.data;
    //     this.showTable = true;
    //     this.cd.detectChanges();
    //   });
    // });

    setTimeout(() => {
      const temp = [
        {
          name: "Subscribers",
          data: [55, 213, 55, 0, 213, 55, 33, 55],
        },
        {
          name: "",
        },
      ];
    }, 3000);
  }
}

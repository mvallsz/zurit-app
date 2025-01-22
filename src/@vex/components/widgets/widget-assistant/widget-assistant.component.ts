import {Component, Input, OnInit} from '@angular/core';
import icCheckCircle from '@iconify/icons-ic/twotone-check-circle';
import icClose from '@iconify/icons-ic/twotone-close';

@Component({
  selector: 'vex-widget-assistant',
  templateUrl: './widget-assistant.component.html',
  styleUrls: ['./widget-assistant.component.scss']
})
export class WidgetAssistantComponent implements OnInit {

  icCheckCircle = icCheckCircle;
  icWarning = icClose;

  @Input()
  shippingCost: string;

  @Input()
  shippingRevenue: string;

  @Input()
  quantities: string;

  constructor() { }

  ngOnInit() {
  }

}

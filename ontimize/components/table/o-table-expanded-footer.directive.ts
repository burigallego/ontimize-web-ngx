
import { forwardRef, Inject, ElementRef, Renderer2, Directive } from '@angular/core';
import { OTableComponent } from './table-components';
import { Subscription } from 'rxjs';
import { HostListener } from '@angular/core';
import { Injector } from '@angular/core';
import { OTranslateService } from '../../services';


@Directive({
  selector: '[oTableExpandedFooter]'
})
export class OTableExpandedFooter {

  tableFooter;
  additionDiv;
  spanMessageNotResults;
  translateService: OTranslateService;

  protected onContentChangeSubscription: Subscription;
  constructor(
    @Inject(forwardRef(() => OTableComponent)) public table: OTableComponent,
    public element: ElementRef,
    private renderer: Renderer2,
    protected injector: Injector
  ) {
    this.translateService = this.injector.get(OTranslateService);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.updateHeight();
  }

  ngAfterViewInit() {
    if (this.element.nativeElement.childNodes[2]) {
      this.tableFooter = this.element.nativeElement.childNodes[2];
    }
    this.registerContentChange();
  }

  registerContentChange() {
    this.additionDiv = this.renderer.createElement('div');
    this.renderer.addClass(this.additionDiv, 'o-table-no-results');
    this.spanMessageNotResults = this.renderer.createElement('span');
    this.renderer.appendChild(this.additionDiv,this.spanMessageNotResults);
    this.renderer.insertBefore(this.element.nativeElement, this.additionDiv, this.tableFooter);
    const self = this;

    this.onContentChangeSubscription = this.table.onContentChange.subscribe((data) => {
      self.updateHeight();
      self.updateMessageNotResults(data);
    });

  }

  updateHeight() {
    const childNodes = this.element.nativeElement.childNodes;
    let totalHeight = 0;
    let diferentHeight = 0;

    childNodes.forEach(function (element) {
      if (['tbody', 'thead', 'tfoot'].indexOf(element.nodeName.toLowerCase()) > -1) {
        totalHeight += element.clientHeight;
      }
    });

    diferentHeight = this.element.nativeElement.parentNode.clientHeight - totalHeight;
    this.renderer.setStyle(this.additionDiv, 'height', (diferentHeight > 0 ? diferentHeight : 0) + 'px');
    this.renderer.setStyle(this.additionDiv, 'width', this.element.nativeElement.clientWidth + 'px');
  }

  updateMessageNotResults(data) {
    if (data.length > 0) {
      this.renderer.removeChild(this.element.nativeElement, this.spanMessageNotResults);
    } else {
      let result = '';
      result = this.translateService.get('TABLE.EMPTY');
      if (this.table.quickFilter && this.table.oTableQuickFilterComponent &&
        this.table.oTableQuickFilterComponent.value && this.table.oTableQuickFilterComponent.value.length > 0) {
        result += this.translateService.get('TABLE.EMPTY_USING_FILTER', [(this.table.oTableQuickFilterComponent.value)]);
        this.spanMessageNotResults = this.renderer.createText(result);
        this.renderer.appendChild(this.additionDiv, this.spanMessageNotResults);
      }


    }
  }

  destroy() {
    if (this.onContentChangeSubscription) {
      this.onContentChangeSubscription.unsubscribe();
    }
  }
}

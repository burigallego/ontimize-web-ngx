import { Router } from '@angular/router';

import { Codes, Util } from '../utils';
import { OFormComponent } from './form/o-form.component';
import { OFormValue } from '../components/form/OFormValue';

export type OQueryDataArgs = {
  replace?: boolean; // Used in the list component for replacing data in setValue method when reloadData method is called
  sqltypes?: Object;
  offset?: number;
  length?: number;
};

export interface ISQLOrder {
  columnName: string;
  ascendent: boolean;
}

export class ServiceUtils {

  static getParentKeysFromForm(parentKeysObject: Object, form: OFormComponent) {
    let result = {};
    const parentKeys = Object.keys(parentKeysObject || {});

    const formComponents = form ? form.getComponents() : {};
    const existsComponents = Object.keys(formComponents).length > 0;

    const formDataProperties = form ? form.getDataValues() : {};
    const existsProperties = Object.keys(formDataProperties).length > 0;

    const urlData = form ? form.getFormNavigation().getFilterFromUrlParams() : {};
    const existsUrlData = Object.keys(urlData).length > 0;

    if (existsComponents || existsProperties || existsUrlData) {
      parentKeys.forEach(key => {
        const formFieldAttr = parentKeysObject[key];
        let currentData;
        if (formComponents.hasOwnProperty(formFieldAttr)) {
          currentData = formComponents[formFieldAttr].getValue();
        } else if (formDataProperties.hasOwnProperty(formFieldAttr)) {
          currentData = formDataProperties[formFieldAttr] instanceof OFormComponent ? formDataProperties[formFieldAttr].value : formDataProperties[formFieldAttr];
        } else if (urlData.hasOwnProperty(formFieldAttr)) {
          currentData = urlData[formFieldAttr];
        }
        if (Util.isDefined(currentData)) {
          switch (typeof (currentData)) {
            case 'string':
              if (currentData.trim().length > 0) {
                result[key] = currentData.trim();
              }
              break;
            case 'number':
              if (!isNaN(currentData)) {
                result[key] = currentData;
              }
              break;
          }
        }
      });
    }
    return result;
  }

  static getFilterUsingParentKeys(parentItem: any, parentKeysObject: Object) {
    let filter = {};
    const parentKeys = Object.keys(parentKeysObject || {});

    if ((parentKeys.length > 0) && (typeof (parentItem) !== 'undefined')) {
      for (let k = 0; k < parentKeys.length; ++k) {
        let parentKey = parentKeys[k];
        if (parentItem.hasOwnProperty(parentKey)) {
          let currentData = parentItem[parentKey];
          if (currentData instanceof OFormValue) {
            currentData = currentData.value;
          }
          filter[parentKey] = currentData;
        }
      }
    }
    return filter;
  }

  static getArrayProperties(array: any[], properties: any[]): any[] {
    const result = array.map(item => {
      return ServiceUtils.getObjectProperties(item, properties);
    });
    return result;
  }

  static getObjectProperties(object: any, properties: any[]): any {
    let objectProperties = {};
    properties.forEach(key => {
      objectProperties[key] = object[key];
    });
    return objectProperties;
  }

  static parseSortColumns(sortColumns: string): Array<ISQLOrder> {
    let sortColArray = [];
    if (sortColumns) {
      let cols = Util.parseArray(sortColumns);
      cols.forEach((col) => {
        let colDef = col.split(Codes.TYPE_SEPARATOR);
        if (colDef.length > 0) {
          let colName = colDef[0];
          const colSort = colDef[1] || Codes.ASC_SORT;
          sortColArray.push({
            columnName: colName,
            ascendent: colSort === Codes.ASC_SORT
          });
        }
      });
    }
    return sortColArray;
  }

  static redirectLogin(router: Router, sessionExpired: boolean = false) {
    let arg = {};
    arg[Codes.SESSION_EXPIRED_KEY] = sessionExpired;
    let extras = {};
    extras[Codes.QUERY_PARAMS] = arg;
    router.navigate([Codes.LOGIN_ROUTE], extras);
  }

}

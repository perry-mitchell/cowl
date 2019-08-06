## Modules

<dl>
<dt><a href="#module_Cowl">Cowl</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#Response">Response</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#RequestOptions">RequestOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_Cowl"></a>

## Cowl
<a name="module_Cowl.request"></a>

### Cowl.request(optionsOrURL) ⇒ [<code>Promise.&lt;Response&gt;</code>](#Response)
Make a request

**Kind**: static method of [<code>Cowl</code>](#module_Cowl)  

| Param | Type | Description |
| --- | --- | --- |
| optionsOrURL | [<code>RequestOptions</code>](#RequestOptions) \| <code>String</code> | An object containing request options  or a string containing the URL to GET |

<a name="Response"></a>

## Response : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The response URL |
| method | <code>String</code> | The method used for the request |
| headers | <code>Object</code> | Response headers |
| data | <code>String</code> \| <code>Object</code> \| <code>Buffer</code> | Response data |
| status | <code>Number</code> | The status code of the response |
| statusText | <code>String</code> | The status text |

<a name="RequestOptions"></a>

## RequestOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The URL to request |
| [method] | <code>String</code> | The HTTP method to use for the request |
| body | <code>Object</code> \| <code>Buffer</code> \| <code>ArrayBuffer</code> \| <code>String</code> | The request body  to send |
| [headers] | <code>Object</code> | The request headers |
| [query] | <code>Object</code> | Query string parameters |
| [withCredentials] | <code>Boolean</code> | Set the XMLHttpRequest 'withCredentials'  property |
| [responseType] | <code>String</code> | Set the response type. This defaults to 'auto'  with which the responseType is not set on the request and is auto-detected when  the response arrives (ideal only for JSON/text). Set it to a valid value as  mentioned in the  [spec](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType). |
| [factory] | <code>function</code> | Function that returns a new XMLHttpRequest instance |
| [validateStatus] | <code>function</code> | Function to validate a status value (return true for OK) |


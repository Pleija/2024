export {};
// import * as protobuf from "protobufjs";
//
// protobuf.load("awesome.proto", function (err, root) {
//     if (err)
//         throw err;
//
//     // Obtain a message type
//     var AwesomeMessage = root.lookupType("awesomepackage.AwesomeMessage");
//
//     // Exemplary payload
//     var payload = { awesomeField: "AwesomeString" };
//
//     // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
//     var errMsg = AwesomeMessage.verify(payload);
//     if (errMsg)
//         throw Error(errMsg);
//
//     // Create a new message
//     var message = AwesomeMessage.create(payload); // or use .fromObject if conversion is necessary
//
//     // Encode a message to an Uint8Array (browser) or Buffer (node)
//     var buffer = AwesomeMessage.encode(message).finish();
//     // ... do something with buffer
//
//     // Decode an Uint8Array (browser) or Buffer (node) to a message
//     var message = AwesomeMessage.decode(buffer);
//     // ... do something with message
//
//     // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.
//
//     // Maybe convert the message back to a plain object
//     var data = AwesomeMessage.toObject(message, {
//         longs: String,
//         enums: String,
//         bytes: String,
//         // see ConversionOptions
//     });
// });
//
//
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9idWYtdGVzdC5tanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9QYWNrYWdlcy9Uc1Byb2ovc3JjL0NvbW1vbi9UZXN0cy9wcm90b2J1Zi10ZXN0Lm10cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMENBQTBDO0FBQzFDLEVBQUU7QUFDRix3REFBd0Q7QUFDeEQsZUFBZTtBQUNmLHFCQUFxQjtBQUNyQixFQUFFO0FBQ0YsK0JBQStCO0FBQy9CLDZFQUE2RTtBQUM3RSxFQUFFO0FBQ0YsMkJBQTJCO0FBQzNCLHVEQUF1RDtBQUN2RCxFQUFFO0FBQ0Ysb0ZBQW9GO0FBQ3BGLG1EQUFtRDtBQUNuRCxrQkFBa0I7QUFDbEIsK0JBQStCO0FBQy9CLEVBQUU7QUFDRiw4QkFBOEI7QUFDOUIscUdBQXFHO0FBQ3JHLEVBQUU7QUFDRixzRUFBc0U7QUFDdEUsNERBQTREO0FBQzVELHNDQUFzQztBQUN0QyxFQUFFO0FBQ0Ysc0VBQXNFO0FBQ3RFLG1EQUFtRDtBQUNuRCx1Q0FBdUM7QUFDdkMsRUFBRTtBQUNGLDhHQUE4RztBQUM5RyxFQUFFO0FBQ0YsMERBQTBEO0FBQzFELG9EQUFvRDtBQUNwRCx5QkFBeUI7QUFDekIseUJBQXlCO0FBQ3pCLHlCQUF5QjtBQUN6QixtQ0FBbUM7QUFDbkMsVUFBVTtBQUNWLE1BQU07QUFDTixFQUFFO0FBQ0YsRUFBRSJ9
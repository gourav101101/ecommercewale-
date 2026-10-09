import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  productId:{type:String,required:true}, variantId:{type:String,required:true,unique:true},
  sellingPrice:{type:Number,default:null,min:0.01,max:10000000}, available:{type:Boolean,required:true},
  packQuantity:{type:Number,default:null,min:1,max:999999,validate:{validator:value=>value==null || Number.isInteger(value),message:'Pack quantity must be a whole number.'}},
  commercial:{
    purchaseCost:{type:Number,default:null,min:0,max:10000000},
    targetMargin:{type:Number,default:null,min:0,max:100},
    stockQuantity:{type:Number,default:null,min:0,max:999999999},
    stockVerifiedAt:{type:Date,default:null},
    gstHsn:{type:String,default:'',maxlength:8},
    gstRate:{type:Number,default:null,min:0,max:100},
    gstTreatment:{type:String,enum:['pending','inclusive','exclusive'],default:'pending'},
    deliveryRule:{type:String,default:'',maxlength:500},
    deliveryCharge:{type:Number,default:null,min:0,max:10000000},
    confirmed:{type:Boolean,default:false},confirmedAt:{type:Date,default:null},
    notes:{type:String,default:'',maxlength:1000},
  },
}, {timestamps:true});
export default mongoose.models.SupplierVariantOverride || mongoose.model('SupplierVariantOverride',schema);

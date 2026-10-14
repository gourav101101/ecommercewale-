import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  itemId:{type:String,required:true,unique:true},
  sourceFile:{type:String,required:true},
  sourceUnitCost:{type:Number,required:true},
  settings:{type:mongoose.Schema.Types.Mixed,required:true},
  revision:{type:Number,required:true,default:1},
  appliedAt:{type:Date,default:null},
}, {timestamps:true});
export default mongoose.models.SupplierPriceRecord || mongoose.model('SupplierPriceRecord',schema);

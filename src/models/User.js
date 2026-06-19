// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "فرمت ایمیل نامعتبر است"]
    },
    username: { type: String },
    password: { type: String, required: true, select: false },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    phone: { type: String },
    age: { type: Number },
    nationalCode: { type: String, unique: true, sparse: true },
    cardNumber: { type: String },
    type: { 
      type: String, 
      enum: ["user", "creator"],
      default: "user" 
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    // نقش‌های جدید مدرسه
    schoolRole: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student'
    },
    // اطلاعات دانش‌آموزی
    studentInfo: {
      parentName: String,
      parentPhone: String,
      emergencyContact: String,
      bloodType: String,
      allergies: [String],
      medicalNotes: String,
      enrolledClass: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
      }
    },
    // اطلاعات دبیری
    teacherInfo: {
      expertise: [String],
      degree: String,
      fieldOfStudy: String,
      university: String,
      yearsOfExperience: Number,
      socials: {
        eitaa: String,
        bale: String,
        telegram: String,
        whatsapp: String,
        shad: String,
        rubika: String,
        soroush: String,
      },
      certifications: [{
        name: String,
        issuer: String,
        date: Date
      }],
      subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
      }],
      classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
      }]
    },
    providerInfo: {
      bio: String,
      expertise: [String],
      experience: Number,
      education: String,
      certificates: [{
        title: String,
        issuer: String,
        year: Number,
        file: String
      }],
      bankInfo: {
        cardNumber: String,
        shebaNumber: String,
        accountHolder: String
      },
      isVerified: { type: Boolean, default: false }
    },
    profile: {
      avatar: String,
      address: String,
      city: String
    },
    // Subscription tier fields
    subscriptionTier: {
      type: String,
      enum: ['BRONZE', 'SILVER', 'GOLD'],
      default: 'BRONZE'
    },
    subscriptionExpiry: {
      type: Date
    }
  },
  { timestamps: true }
);
userSchema.index({ school: 1 });
userSchema.index({ type: 1 });
userSchema.index({ phone: 1 }, { sparse: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

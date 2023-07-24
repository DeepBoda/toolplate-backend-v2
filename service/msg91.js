const axios = require("axios").default;
const msg91Config = require("../config/msg91Config");
const otpSendCountFnc = require("../modules/otpSendCount/utils");
const otpService = require("../modules/otpSendCount/service");

/**
 *
 * @param {Number} mobile
 * @returns
 */
exports.sendOTP = async (mobile) => {
  const isReachedOTPLimit = await otpSendCountFnc.checkUserReachedOtpLimit(
    mobile
  );
  if (isReachedOTPLimit)
    return {
      type: "error",
      message:
        "You have reached the limit for resending OTPs. Please try again after 10 mins.",
    };
  const url = `${msg91Config.baseURL}/otp?template_id=${msg91Config.otpTemplateId}&otp_expiry=1&mobile=91${mobile}&authkey=${msg91Config.authKey}&otp_length=6`;
  let otpResponse = await axios.get(url);
  console.log(otpResponse.data);
  await otpService.create({ mobile, type: "otp" });
  return otpResponse.data;
};

/**
 *
 * @param {Number} otp
 * @param {Number} mobile
 * @returns
 */
exports.verifyOTP = async (otp, mobile) => {
  const url = `${msg91Config.baseURL}/otp/verify?otp=${otp}&authkey=${msg91Config.authKey}&mobile=91${mobile}`;
  let otpResponse = await axios.get(url);
  console.log(otpResponse.data);
  return otpResponse.data;
};

/**
 *
 * @param {Number} mobile
 * @returns
 */
exports.resendOTP = async (mobile) => {
  const isReachedOTPLimit = await otpSendCountFnc.checkUserReachedOtpLimit(
    mobile
  );
  if (isReachedOTPLimit)
    return {
      type: "error",
      message:
        "You have reached the limit for resending OTPs. Please try again after 10 mins.",
    };
  const url = `${msg91Config.baseURL}/otp/retry?&mobile=91${mobile}&authkey=${msg91Config.authKey}&retrytype=text`;
  let resendOTPResponse = await axios.get(url);
  console.log(resendOTPResponse.data);
  let otpResponse = await this.sendOTP(mobile);
  return otpResponse;
};

/**
 *
 * @param {Object} data
 * @returns This function return proper message for OTP related errors
 */
exports.getMessage = (data) => {
  switch (data.message) {
    case "Mobile no. not found":
      return "Please enter a phone number that is based in India.";
    case "OTP expired":
      return "Your OTP is expired. Please resend OTP and verify again.";
    case "Mobile no. already verified":
      return "Your mobile number already verified.";
    default:
      return "Your OTP is invalid. Please enter the correct OTP.";
  }
};

import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import avatar from "@/assets/images/all-img/thumb-1.png";
import SocialProfile from "@/pages/app/Account/SocialProfile";

const Profile = () => {
  return (
    <div className="w-full  bg-[#334155] rounded-[6px]">
      <div className="p-[24px] flex flex-col gap-[1rem] max-[425px]:px-[10px]">
        <div>
          <h1 className="text-[24px]">Account</h1>
          <p>Edit your account details.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatar}
              alt=""
              className=" w-[130px] h-[130px] rounded-full max-[640px]:w-[100px] max-[640px]:h-[100px]"
            />
            <div className="absolute bottom-0 right-1 bg-[#0f172a] p-2 rounded-full max-[640px]:right-[-5px]">
              <img src="/icons/edit.svg" alt="" className="w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col gap-[10px]">
            <div>
              <p>Name</p>
              <p>Email</p>
            </div>

            <div className="mt-2">
              <SocialProfile />
            </div>
          </div>
        </div>

        <div className="w-full flex items-end gap-2 max-[425px]:flex-col">
          <Textinput
            label="Profile Name"
            id="h_Fullname2"
            type="text"
            placeholder="Full name"
            className="w-full h-[40px] rounded-[6px] font-bold"
          />
          <Button
            text="edit"
            className="w-[112px] h-[40px] btn-outline-light rounded-[999px] max-[425px]:w-full"
          />
        </div>

        <div className="w-full flex items-end gap-2 max-[425px]:flex-col">
          <Textinput
            label="Email"
            id="h_email2"
            type="email"
            placeholder="Type your email"
            className="h-[40px] rounded-[6px] font-bold"
          />
          <Button
            text="edit"
            className="w-[112px] h-[40px] btn-outline-light rounded-[999px] max-[425px]:w-full"
          />
        </div>

        <div className="w-full flex items-end gap-2 max-[425px]:flex-col">
          <Textinput
            label="Phone number"
            id="h_phone2"
            type="phone"
            placeholder="Phone number"
            className="h-[40px] rounded-[6px]"
          />
          <Button
            text="edit"
            className="w-[112px] h-[40px] btn-outline-light rounded-[999px] max-[425px]:w-full"
          />
        </div>
        <div className="flex justify-end">
          <Button
            icon="heroicons-outline:newspaper"
            text="Save Changes"
            className="bg-[#0F172A]  rounded-[999px] hover:bg-[#0F172A]/80"
          />
        </div>
      </div>
    </div>
  );
};
export default Profile;

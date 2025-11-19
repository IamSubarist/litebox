import Profile from "@/pages/app/Account/Profile";
import UpdatePassword from "@/pages/app/Account/UpdatePassword";
import DeleteAccount from "@/pages/app/Account/DeleteAccount";
const AccountPage = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="flex flex-col justify-center gap-8">
        <div>
          <p className="text-[30px] font-bold">Settings</p>
          <p>Manage account settings and email preferences.</p>
        </div>
        <Profile />
        <div className="w-full  flex justify-center gap-8 max-[1260px]:flex-col">
          <UpdatePassword />
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

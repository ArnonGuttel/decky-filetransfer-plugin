import {
  ButtonItem,
  definePlugin,
  DialogButton,
  Menu,
  MenuItem,
  PanelSection,
  PanelSectionRow,
  Router,
  ServerAPI,
  showContextMenu,
  staticClasses,
} from "decky-frontend-lib";
import { VFC } from "react";
import { FaShip } from "react-icons/fa";
import logo from "../assets/logo.png";
import FileExplorer from "./file_explorer"; // Import your FileExplorer component
import { Backend } from "./server";

const Content: VFC = () => {
  return (
    <PanelSection title="Test Section">
      {console.log("helllooooo arnon 0")};
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={(e: { currentTarget: any; }) =>
            showContextMenu(
              <Menu label="Menu" cancelText="CAAAANCEL" onCancel={() => { }}>
                <MenuItem onSelected={() => { }}>Item #1</MenuItem>
                <MenuItem onSelected={() => { }}>Item #2</MenuItem>
                <MenuItem onSelected={() => { }}>Item #3</MenuItem>
              </Menu>,
              e.currentTarget ?? window
            )
          }
        >
          arnon says yolo!!!
        </ButtonItem>
      </PanelSectionRow>

      <PanelSectionRow>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img src={logo} />
        </div>
      </PanelSectionRow>

      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={() => {
            Router.CloseSideMenus();
            Router.Navigate("/file-explorer-page");
            Router.Navigate
          }}
        >
          File Explorer Page
        </ButtonItem>
      </PanelSectionRow>

    </PanelSection>
  );
};


export default definePlugin((serverApi: ServerAPI) => {
  const backend = Backend.initialize(serverApi);
  serverApi.routerHook.addRoute(
    '/file-explorer-page',
    () => <FileExplorer backend={backend} />,
    {
      exact: true
    }
  )

  return {
    title: <div className={staticClasses.Title}>DeckFT</div>,
    content: <Content />,
    icon: <FaShip />,
    // onDismount() {
    //   serverApi.routerHook.removeRoute("/decky-plugin-test");
    // },
  };
});

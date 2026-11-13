# Drive comparison evidence

Comparison updated: 13 November 2026. The original 29-family portfolio and embedded photographs
were reviewed on 12 November. The HTML is the complete offline deliverable; these notes record the
main comparison decisions so they can be reviewed without extracting the embedded product data.

## How conclusions are presented

Each comparison uses the two selected families, rather than a generic claim about a manufacturer.

- **Capability difference:** a function documented for one scope is explicitly outside the other
  reviewed scope. The model, software and option restrictions are retained in the displayed text.
- **Provision difference:** an included function is compared with an extra option, selected model or
  software licence. This does not mean the other drive cannot provide the function.
- **Different implementation:** the documents describe different architectures or external hardware.
  This does not produce a claimed feature advantage.
- **Evidence gap:** a function has not been established. Missing documentation does not establish
  that a drive lacks the function.

The coloured counts describe these individual findings; they are not performance scores or overall
rankings. A family-wide rating, safety label or network list is not a complete order specification.
Every feature row links the evidence for both products. The full nine-row table retains the broader
context of installation, power, control, motor type, networks, safety, positioning, energy and service.

## Principal checks behind the revised differences

| Comparison point | Evidence and scope | Consequence shown |
| --- | --- | --- |
| NORD PRO positioning | [BU 0600 en-2324](https://media.nord.com/res/Document/235094.pdf), Table 2, printed pp. 12–14; [current product data](https://www.nord.com/en/products/drive-electronics/inverters-for-control-cabinet-installation/nordac-pro-sk-500p-frequency-inverter.jsp) | POSICON is integrated; feedback/interface requirements still depend on the selected model. |
| G120C positioning and STO | [Siemens G120 control-unit comparison](https://support.industry.siemens.com/cs/attachments/109478829/G120_CU250S2_BA13_0415_PI_eng.pdf), G120C versus CU250S-2; [G120C product information](https://www.siemens.com/en-gb/products/sinamics/g120c/); [specific PN article](https://sieportal.siemens.com/en-gb/products-services/detail/6SL3210-1KE22-6AF1) | G120C lacks the drive-integrated positioner of the compared scope but includes STO. An external PLC position loop is a different implementation. The historical comparison document is not presented as a current firmware release note. |
| NORD PRO safe functions | [BU 0630 en-0322](https://media.nord.com/res/Document/111555.pdf), §2.2, pp. 15–16; Table 2 in BU 0600 | Distinguish onboard SK 510P/540P from CU5-equipped SK 530P/550P. The reviewed safety manual covers STO and SS1-t, rather than integrated SLS/SMS. CU5-MLT encoder support is not proof of safe-speed monitoring. |
| NORD ON extended safety | [BU 0840](https://media.nord.com/res/Document/330084.pdf), SK 3x2P, §3.9.3 and P820–P824 | SLS/SMS/SSM depend on the applicable safety control unit and device. Do not transfer the scope to SK 3x1P or ON PURE. |
| ON PURE safety | [BU 0800 en-GB-2625](https://media.nord.com/res/Document/284396.pdf), Table 2, pp. 11–12 | The reviewed SK 350P has no integrated functional safety. |
| G120D energy recovery | [Siemens G120D technical overview](https://www.siemens.com/en-gb/products/sinamics/g120d/) | Regenerative feedback to the line is a substantive difference from a chopper/resistor arrangement. |
| G115D braking | [Siemens G115D operating instructions 01/2024](https://cache.industry.siemens.com/dl/files/529/109827529/att_1166343/v1/G115D_op_instr_0124_en-US.pdf) | Integrated/external resistor provision is distinct from G120D line regeneration; installation variants have different ratings. |
| SEW MOVITRAC advanced | [Manufacturer technical data, MOVIKIT, DDI and functional-safety table](https://www.sew-eurodrive.co.uk/products/movi-c-automation-system/control_cabinet_technology/hardware/movitrac-advanced-standard-inverter/movitrac-advanced-standard-inverter.html) | Basic STO is PL d; selected safety variants add safe motion and communication. Positioning and DDI are qualified by their software and compatible hardware. |
| SEW MOVIMOT families | [flexible](https://www.sew-eurodrive.co.uk/products/movi-c-automation-system/decentralised_drive_technology/decentralised-inverters/movimot-flexible-field-distributor/movimot-flexible-field-distributor.html), [advanced](https://www.sew-eurodrive.co.uk/products/decentralised-drives-mechatronics/antriebseinheit-/movimot-advanced/movimot-advanced.html), [performance](https://www.seweurodrive.com/products/decentralized-drives-mechatronics/antriebseinheit-/movimot-performance-drive-unit/movimot-performance-drive-unit.html), technical data, communication and safety sections | Distinguish field inverter and complete motor/drive units, DDI hardware, optional positioning feedback, and duty-qualified overload. |
| ABB ACS380 and ACS580 | [ACS380 technical data/key benefits](https://www.abb.com/global/en/areas/motion/drives/low-voltage-ac-drives/machinery-drives/acs380), [ACS580 technical data/key benefits](https://www.abb.com/global/en/areas/motion/drives/low-voltage-ac-drives/general-purpose-drives/acs580) | Standard STO and stated ranges are meaningful. Unestablished positioning functions remain evidence gaps, rather than claimed omissions. ACS380 and ACS380-E are kept distinct. |
| ABB ACS880 regeneration | [ACS880-11](https://www.abb.com/global/en/areas/motion/drives/low-voltage-ac-drives/industrial-drives/acs880-single-drives/acs880-11), [ACS880-14](https://www.abb.com/global/en/areas/motion/drives/low-voltage-ac-drives/industrial-drives/acs880-drive-modules/acs880-14) | Regenerative suffixes have different supply hardware. The capability is not attributed to an ordinary ACS880-01. |
| Danfoss FC 302 motion | [FC 301/302 design guide](https://assets.danfoss.com/documents/latest/272132/AJ286655760917en-002201.pdf), §5.2; [Danfoss IMC description](https://www.danfoss.com/en/about-danfoss/our-businesses/drives/drives-expert-hub/integrated-motion-controller/) | IMC positioning/homing/synchronisation requires the documented IMC software branch, 48.XX / type-code S067. It is not an unqualified standard feature of every FC 302 firmware. |
| Danfoss iC7 | [Selection guide AD503139935297en-US0501](https://assets.danfoss.com/documents/latest/602572/AD503139935297en-US0501.pdf), communication licences and +DD11 Motion; [product information](https://www.danfoss.com/en/products/dds/low-voltage-drives/ic7-drives/ic7-automation/) | Ports, protocol licences and Motion activation are separate selection questions. AFE/system variants do not make every compact converter regenerative. |
| Schneider ATV320 safe speed | [Catalogue DIA2ED2160311EN](https://www.se.com/us/en/download/document/DIA2ED2160311EN/), [FA367976](https://www.se.com/uk/en/faqs/FA367976/) | Embedded STO, SS1, SLS, SMS and GDL are distinguished from STO-only scope. Certification and operating constraints differ by function. |
| Schneider ATV340 safety expansion | [FAQ000192179](https://www.se.com/us/en/faqs/FAQ000192179/), [catalogue DIA2ED2160701EN](https://download.se.com/files?p_Doc_Ref=DIA2ED2160701EN&p_File_name=Catalog+Altivar+Machine+ATV340+Variable+speed+drives.pdf) | VW3A3802 adds SS1/SLS/SMS/SBC; compatible firmware and the adapter for size D30 and above must be checked. Sensor-based positioning is not asserted to equal a servo position loop. |
| Schneider ATV600 application scope | [Manufacturer range](https://www.se.com/sg/en/product-range/62317-altivar-process-atv600/) | Fluid-management focus and system ratings are described without inventing a precision-motion advantage. |
| Yaskawa GA500 | [GA500 data sheet](https://www.yaskawa.eu.com/Global%20Assets/Downloads/Brochures_Catalogues/Inverter_Drives/GA500/GA500_Data_sheet_en.pdf), pp. 6–8, 11 and network options | HD/ND current ratings differ, Ethernet is optional, and induction/PM/SynRM control is documented. Unestablished drive-local positioning is not called absent. |
| Yaskawa GA700 | [Manufacturer technical overview](https://www.yaskawa.eu.com/ac-drives/ac-drives/general-purpose/ga700) and product options retained in HTML | Network/feedback options and frame-dependent braking are explicit. Separate regenerative hardware is not scored as an integrated feature. |
| Beckhoff AX8000 | [Manufacturer system features](https://www.beckhoff.com/en-gb/products/motion/servo-drives/ax8000-multi-axis-servo-system/), XFC, distributed clocks, OCT and TwinSAFE sections | Coordinated servo architecture is distinguished from a single geared-motor inverter. DC sharing and an external regenerative unit are different supply arrangements. |
| Beckhoff AMP8000 | [System overview](https://www.beckhoff.com/en-gb/products/motion/distributed-drive-systems/amp8000-distributed-servo-drive-system/), [product characteristics](https://infosys.beckhoff.com/content/1033/amp8000_ba/12131368075.html) | Integrated motor/servo feedback and EtherCAT P distribution are assessed as a system, with supply/distribution/motion scope included. |

## Verification of this revision

`node --test tests/*.test.cjs` covers all 180 selectable pairs, feature provenance, absence versus
unknown states, selected representative differences, valid references, offline photographs and the
existing motor/transition models. All inline executable JavaScript is parsed.

Browser rendering was unavailable: the local Chromium process was blocked by the execution
environment, and the cloud browser disallows local-file previews. No fresh screenshot or claim of
desktop/mobile browser validation is included for this revision.
